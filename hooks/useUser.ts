import { useUser as useClerkUser } from '@clerk/nextjs';

export interface UserData {
  email: string | null;
  name: string | null;
  profilePic: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

export function useUser(): UserData {
  const { user, isLoaded, isSignedIn } = useClerkUser();

  return {
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user?.fullName ?? user?.firstName ?? null,
    profilePic: user?.imageUrl ?? null,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
  };
}
