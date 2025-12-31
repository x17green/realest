'use client'

import React, { useState, useRef } from 'react'
import { Avatar } from '@heroui/react'
import { Camera, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateSignedUrl } from '@/lib/utils/upload-utils'
import { useUser } from '@/lib/hooks/useUser'
import { RealEstButton } from '@/components/heroui/RealEstButton'

interface ProfileUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onUploadSuccess?: (avatarUrl: string) => void
  onUploadError?: (error: string) => void
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-24'
}

const iconSizes = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-6'
}

export function ProfileUpload({
  size = 'md',
  className,
  onUploadSuccess,
  onUploadError
}: ProfileUploadProps) {
  const { user, profile } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Avatar fallback logic: preview -> profile avatar -> full_name initial -> email initial -> default
  const avatarUrl = previewUrl || profile?.avatar_url
  const getAvatarFallback = () =>
    profile?.full_name?.charAt(0) ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U"

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      onUploadError?.('File size must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    await uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    if (!user?.id) {
      onUploadError?.('User not authenticated')
      return
    }

    setIsUploading(true)

    try {
      // Generate signed URL for avatar upload
      const { signed_url, public_url, token } = await generateSignedUrl({
        bucket: 'avatars',
        file_name: `${user.id}-${Date.now()}.${file.name.split('.').pop()}`,
        file_type: file.type,
        file_size: file.size,
        user_id: user.id
      })

      // Upload file to signed URL
      const uploadResponse = await fetch(signed_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar')
      }

      // Update profile with new avatar URL
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: public_url })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update profile')
      }

      // Clear preview and notify success
      setPreviewUrl(null)
      onUploadSuccess?.(public_url)

    } catch (error) {
      console.error('Avatar upload error:', error)
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
      setPreviewUrl(null) // Clear preview on error
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemovePreview = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar with upload overlay */}
      <div
        className={cn(
          'relative rounded-full border-2 border-border/50 overflow-hidden cursor-pointer group',
          'hover:border-brand-accent/50 transition-colors duration-200',
          sizeClasses[size]
        )}
        onClick={handleClick}
      >
        <Avatar className={cn('w-full h-full', sizeClasses[size])}>
          {avatarUrl && (
            <Avatar.Image
              alt={profile?.full_name || "User"}
              className="rounded-full object-cover"
              src={avatarUrl}
            />
          )}
          <Avatar.Fallback delayMs={600}>
            <div className="rounded-full w-full h-full border justify-center items-center flex bg-muted-foreground/10">
              {getAvatarFallback()}
            </div>
          </Avatar.Fallback>
        </Avatar>

        {/* Upload overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/50 rounded-full flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          isUploading && 'opacity-100'
        )}>
          {isUploading ? (
            <div className="animate-spin rounded-full border-2 border-white border-t-transparent size-4" />
          ) : (
            <Camera className={cn('text-white', iconSizes[size])} />
          )}
        </div>

        {/* Preview remove button */}
        {previewUrl && !isUploading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRemovePreview()
            }}
            className={cn(
              'absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full',
              'flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors',
              size === 'sm' ? 'size-4' : size === 'md' ? 'size-5' : 'size-6'
            )}
          >
            <X className={size === 'sm' ? 'size-2.5' : 'size-3'} />
          </button>
        )}
      </div>

      {/* Upload instructions for larger sizes */}
      {size === 'xl' && (
        <div className="mt-2 text-center">
          <RealEstButton
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
            className="text-xs"
          >
            <Upload className="size-3 mr-1" />
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </RealEstButton>
        </div>
      )}
    </div>
  )
}

// Convenience component for profile page
export function ProfileAvatarUpload(props: Omit<ProfileUploadProps, 'size'>) {
  return <ProfileUpload size="xl" {...props} />
}

// Convenience component for dropdown/header
export function ProfileAvatarSmall(props: Omit<ProfileUploadProps, 'size'>) {
  return <ProfileUpload size="sm" {...props} />
}