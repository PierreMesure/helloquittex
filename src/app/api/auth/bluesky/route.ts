import { NextResponse } from "next/server"
import { BskyAgent } from '@atproto/api'
import { auth } from "@/app/auth"
import { supabaseAdapter, BlueskyProfile } from "@/lib/supabase-adapter"

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    const session = await auth();

    // Bluesky Authentication
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    
    let bskySession;
    let profile;
    
    try {
      bskySession = await agent.login({ identifier, password });
      profile = await agent.getProfile({ actor: bskySession.data.handle });
    } catch (error: any) {
      console.error('Bluesky authentication error:', error);
      // Gestion spécifique des erreurs Bluesky
      if (error.message.includes('Invalid identifier or password')) {
        return NextResponse.json(
          { success: false, error: 'Invalid identifier or password' },
          { status: 401 }
        );
      } else if (error.message.includes('Network Error')) {
        return NextResponse.json(
          { success: false, error: 'Unable to connect to Bluesky. Please check your internet connection.' },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: error.message || 'Error in Bluesky authentication' },
          { status: 401 }
        );
      }
    }

    let userId = session?.user?.id;
    let user;

    if (!supabaseAdapter.getUserByAccount || !supabaseAdapter.updateUser || 
        !supabaseAdapter.createUser || !supabaseAdapter.linkAccount) {
      throw new Error('Required adapter methods are not implemented');
    }

    try {
      // Vérification si l'utilisateur existe avec cet ID Bluesky
      const existingUser = await supabaseAdapter.getUserByAccount({
        provider: 'bluesky',
        providerAccountId: bskySession.data.did
      });

      if (existingUser) {
        // Si le compte Bluesky est déjà lié à un autre utilisateur
        if (userId && existingUser.id !== userId) {
          return NextResponse.json(
            { success: false, error: 'This Bluesky account is already linked to another user' },
            { status: 409 }
          );
        }
        // L'utilisateur existe, mise à jour du profil
        userId = existingUser.id;
        const blueskyProfile: BlueskyProfile = {
          did: bskySession.data.did,
          handle: bskySession.data.handle,
          displayName: profile.data.displayName,
          avatar: profile.data.avatar
        };
        user = await supabaseAdapter.updateUser(userId, {
          provider: 'bluesky',
          profile: blueskyProfile
        });
      } else if (userId) {
        // L'utilisateur est connecté mais pas lié à ce compte Bluesky
        const blueskyProfile: BlueskyProfile = {
          did: bskySession.data.did,
          handle: bskySession.data.handle,
          displayName: profile.data.displayName,
          avatar: profile.data.avatar
        };
        user = await supabaseAdapter.updateUser(userId, {
          provider: 'bluesky',
          profile: blueskyProfile
        });
      } else {
        // Création d'un nouvel utilisateur
        const blueskyProfile: BlueskyProfile = {
          did: bskySession.data.did,
          handle: bskySession.data.handle,
          displayName: profile.data.displayName,
          avatar: profile.data.avatar
        };
        user = await supabaseAdapter.createUser({
          provider: 'bluesky',
          profile: blueskyProfile
        });
        userId = user.id;

        // Liaison du compte pour le nouvel utilisateur
        await supabaseAdapter.linkAccount({
          provider: 'bluesky',
          type: 'oauth',
          providerAccountId: bskySession.data.did,
          access_token: bskySession.data.accessJwt,
          refresh_token: bskySession.data.refreshJwt,
          userId: userId,
          expires_at: undefined,
          token_type: 'bearer',
          scope: undefined,
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          bluesky_id: bskySession.data.did,
          bluesky_username: bskySession.data.handle,
          bluesky_image: profile.data.avatar,
        }
      });

    } catch (error: any) {
      console.error('Database operation error:', error);
      return NextResponse.json(
        { success: false, error: 'Error while saving user data' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!supabaseAdapter.deleteSession) {
    throw new Error('Required adapter methods are not implemented');
  }
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Get CSRF token from request headers
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }

    // Delete the session from the database
    await supabaseAdapter.deleteSession(session.user.id);

    const cookieStore = await cookies();
    
    // Clear session cookies
    cookieStore.delete('next-auth.session-token');
    cookieStore.delete('next-auth.csrf-token');
    cookieStore.delete('next-auth.callback-url');

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': [
            'next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'next-auth.csrf-token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'next-auth.callback-url=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
          ].join(', ')
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}