"use client";

import Link from "next/link";
import { Button, Card, Link as HeroLink } from "@heroui/react";
import { CheckCircle, Mail } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card.Root className="w-full max-w-md">
        <Card.Header className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          <Card.Title className="text-2xl font-bold">
            Account Created!
          </Card.Title>
          <Card.Description>
            Welcome to RealProof - where every property is verified
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="text-sm">
                Check your email to verify your account
              </span>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                We've sent you a verification link. Please check your email and
                click the link to activate your account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              as={Link}
              href="/auth/login"
              variant="primary"
              className="w-full"
            >
              Go to Sign In
            </Button>

            <div className="text-center">
              <HeroLink as={Link} href="/" className="text-sm">
                Back to Homepage
              </HeroLink>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
