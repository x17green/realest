-- realest/supabase/migrations/20241201000000_add_user_features.sql

-- Create saved_properties table for user's favorite properties
CREATE TABLE IF NOT EXISTS saved_properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure a user can't save the same property twice
    UNIQUE(user_id, property_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_property_id ON saved_properties(property_id);

-- Create notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'inquiry_received',
        'property_status_changed',
        'property_approved',
        'property_rejected',
        'duplicate_detected',
        'system_message'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS on both tables
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_properties
CREATE POLICY "Users can view their own saved properties" ON saved_properties
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save properties" ON saved_properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave properties" ON saved_properties
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Allow system/service role to create notifications

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to create notification when inquiry is received
CREATE OR REPLACE FUNCTION notify_owner_of_inquiry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT
        p.owner_id,
        'inquiry_received',
        'New Property Inquiry',
        'Someone is interested in your property: ' || p.title,
        jsonb_build_object(
            'property_id', NEW.property_id,
            'inquiry_id', NEW.id,
            'buyer_name', pr.full_name
        )
    FROM properties p
    JOIN profiles pr ON pr.id = NEW.user_id
    WHERE p.id = NEW.property_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification when property status changes
CREATE OR REPLACE FUNCTION notify_owner_of_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            NEW.owner_id,
            'property_status_changed',
            CASE
                WHEN NEW.status = 'live' THEN 'Property Approved!'
                WHEN NEW.status = 'rejected' THEN 'Property Rejected'
                WHEN NEW.status = 'pending_vetting' THEN 'Property Under Review'
                ELSE 'Property Status Updated'
            END,
            CASE
                WHEN NEW.status = 'live' THEN 'Your property has been approved and is now live on the platform.'
                WHEN NEW.status = 'rejected' THEN 'Your property listing has been rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'Contact support for details.')
                WHEN NEW.status = 'pending_vetting' THEN 'Your property documents have been validated and are now under physical vetting.'
                ELSE 'Your property status has been updated.'
            END,
            jsonb_build_object(
                'property_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'rejection_reason', NEW.rejection_reason
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trigger_notify_owner_of_inquiry
    AFTER INSERT ON inquiries
    FOR EACH ROW EXECUTE FUNCTION notify_owner_of_inquiry();

CREATE TRIGGER trigger_notify_owner_of_status_change
    AFTER UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION notify_owner_of_status_change();

-- Add comments for documentation
COMMENT ON TABLE saved_properties IS 'Stores user favorite/saved properties for quick access';
COMMENT ON TABLE notifications IS 'Real-time notifications for users about inquiries, status changes, etc.';
COMMENT ON COLUMN notifications.data IS 'Additional context data in JSON format for the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: inquiry_received, property_status_changed, etc.';
