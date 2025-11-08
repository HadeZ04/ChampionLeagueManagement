import React, { useEffect, useState } from 'react'
import { ShieldCheck, LogOut, RefreshCw, User, Mail, Lock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import AuthService from '../../../layers/application/services/AuthService'

const initialProfileForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
}

const initialLoginForm = {
  username: '',
  password: ''
}

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const bootstrapProfile = async () => {
    if (!AuthService.isAuthenticated()) {
      setProfile(null)
      setProfileForm(initialProfileForm)
      return
    }

    setIsLoadingProfile(true)
    try {
      const currentProfile = await AuthService.getCurrentUser()
      setProfile(currentProfile)
      setProfileForm({
        firstName: currentProfile?.firstName ?? '',
        lastName: currentProfile?.lastName ?? '',
        email: currentProfile?.email ?? '',
        password: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error(error)
      toast.error('Unable to load your profile details.')
      setProfile(null)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    bootstrapProfile()
  }, [])

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsAuthenticating(true)
    try {
      await AuthService.login(loginForm)
      await bootstrapProfile()
      toast.success('Signed in successfully.')
      setLoginForm(initialLoginForm)
    } catch (error) {
      console.error(error)
      toast.error(error?.message ?? 'Unable to sign in with those credentials.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    if (!profile) {
      return
    }

    const updates = {}
    if (profileForm.firstName && profileForm.firstName !== profile.firstName) {
      updates.firstName = profileForm.firstName
    }
    if (profileForm.lastName && profileForm.lastName !== profile.lastName) {
      updates.lastName = profileForm.lastName
    }
    if (profileForm.email && profileForm.email !== profile.email) {
      updates.email = profileForm.email
    }
    if (profileForm.password || profileForm.confirmPassword) {
      if (profileForm.password !== profileForm.confirmPassword) {
        toast.error('New password confirmation does not match.')
        return
      }
      if (profileForm.password.length < 8) {
        toast.error('Password must contain at least 8 characters.')
        return
      }
      updates.password = profileForm.password
    }

    if (Object.keys(updates).length === 0) {
      toast('No changes detected.')
      return
    }

    setIsUpdating(true)
    try {
      const updatedProfile = await AuthService.updateProfile(updates)
      setProfile(updatedProfile)
      setProfileForm((prev) => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }))
      toast.success('Profile updated.')
    } catch (error) {
      console.error(error)
      toast.error(error?.message ?? 'Unable to update your profile right now.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    await AuthService.logout()
    setProfile(null)
    setProfileForm(initialProfileForm)
    toast.success('You have been signed out.')
  }

  const isAuthenticated = Boolean(profile)

  return (
    <div className="bg-slate-50 py-12">
      <Toaster position="top-right" />
      <div className="uefa-container max-w-5xl">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <ShieldCheck size={14} />
            Secure account
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Your UEFA profile</h1>
          <p className="text-gray-600">
            Manage your contact details, linked email, and secure password for all public experiences.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <aside className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-600/10 p-3 text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.username}</p>
                </div>
              </div>
              <dl className="mt-6 space-y-3 text-sm text-gray-600">
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Email</dt>
                  <dd className="font-medium">{profile.email}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Status</dt>
                  <dd className="font-medium capitalize">{profile.status}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Roles</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {profile.roles?.length > 0 ? (
                      profile.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">viewer</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
                <button
                  type="button"
                  onClick={bootstrapProfile}
                  disabled={isLoadingProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <RefreshCw size={16} className={isLoadingProfile ? 'animate-spin' : ''} />
                  Refresh data
                </button>
              </div>
            </aside>

            <form onSubmit={handleProfileSubmit} className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal information</h2>
                <p className="text-sm text-gray-500">Update your basic contact details used for fan experiences.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  First name
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Last name
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </label>
              </div>

              <label className="mt-4 flex flex-col gap-1 text-sm font-medium text-gray-700">
                Email address
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </label>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                <p className="text-sm text-gray-500">Leave blank unless you want to change your password.</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                    New password
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={profileForm.password}
                        onChange={handleProfileChange}
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                    Confirm password
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={profileForm.confirmPassword}
                        onChange={handleProfileChange}
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={bootstrapProfile}
                  disabled={isLoadingProfile}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <form onSubmit={handleLoginSubmit} className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Sign in to continue</h2>
              <p className="text-sm text-gray-500">
                Use the credentials you created during signup to access your viewer dashboard.
              </p>

              <label className="mt-6 flex flex-col gap-1 text-sm font-medium text-gray-700">
                Username
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    autoComplete="username"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </label>

              <label className="mt-4 flex flex-col gap-1 text-sm font-medium text-gray-700">
                Password
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    autoComplete="current-password"
                    minLength={6}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </label>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isAuthenticating ? 'Signing in...' : 'Sign in'}
              </button>

              <p className="mt-4 text-xs text-gray-500">
                Viewer accounts use the same authentication service as administrators but only receive the `viewer`
                role, which limits access to public-only APIs.
              </p>
            </form>

            <div className="lg:col-span-2 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
              <h3 className="text-xl font-semibold">Why complete your profile?</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-1" />
                  Secure access across fantasy, gaming, and ticketing experiences.
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-1" />
                  Update contact details that UEFA uses for notifications.
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-1" />
                  Seamlessly upgrade to higher roles when an administrator invites you.
                </li>
              </ul>
              <p className="mt-4 text-xs text-blue-100">
                Need an account?{' '}
                <a href="/signup" className="font-semibold text-white underline">
                  Create one here
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
