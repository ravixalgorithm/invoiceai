import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if user has an organization
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { count } = await supabase
                    .from('organizations')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                // If no organization, redirect to onboarding
                if (count === 0) {
                    return NextResponse.redirect(`${origin}/onboarding`)
                }
            }

            const next = searchParams.get('next') ?? '/dashboard'
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
