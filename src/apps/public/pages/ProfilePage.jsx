import React, { useEffect, useState } from 'react'
import { ShieldCheck, LogOut, RefreshCw, User, Mail, Lock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import AuthService from '../../../layers/application/services/AuthService'
import { useAuth } from '../../../layers/application/context/AuthContext'
import { toRoleLabel, toUserStatusLabel } from '../../../shared/utils/vi'

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
  const { user, login, logout, refreshProfile, isAuthenticated, status } = useAuth()
  const [profile, setProfile] = useState(user ?? null)
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const bootstrapProfile = async () => {
    if (!isAuthenticated) {
      setProfile(null)
      setProfileForm(initialProfileForm)
      return
    }

    setIsLoadingProfile(true)
    try {
      const currentProfile = await refreshProfile()
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
      toast.error('Không thể tải thông tin hồ sơ của bạn.')
      setProfile(null)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    bootstrapProfile()
  }, [isAuthenticated])

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
    try {
      await login(loginForm)
      await bootstrapProfile()
      toast.success('Đăng nhập thành công.')
      setLoginForm(initialLoginForm)
    } catch (error) {
      console.error(error)
      toast.error('Không thể đăng nhập với thông tin này.')
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
        toast.error('Xác nhận mật khẩu mới không khớp.')
        return
      }
      if (profileForm.password.length < 8) {
        toast.error('Mật khẩu phải có ít nhất 8 ký tự.')
        return
      }
      updates.password = profileForm.password
    }

    if (Object.keys(updates).length === 0) {
      toast('Không có thay đổi nào.')
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
      toast.success('Đã cập nhật hồ sơ.')
    } catch (error) {
      console.error(error)
      toast.error('Hiện không thể cập nhật hồ sơ. Vui lòng thử lại sau.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setProfile(null)
    setProfileForm(initialProfileForm)
    toast.success('Bạn đã đăng xuất.')
  }

  const isProfileLoaded = Boolean(profile)
  const isAuthenticating = status === 'authenticating'

  return (
    <div className="bg-slate-50 py-12">
      <Toaster position="top-right" />
      <div className="uefa-container max-w-5xl">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <ShieldCheck size={14} />
            Tài khoản an toàn
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Hồ sơ UEFA của bạn</h1>
          <p className="text-gray-600">
            Quản lý thông tin liên hệ, email liên kết và mật khẩu để sử dụng các tính năng công khai.
          </p>
        </div>

        {isProfileLoaded ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <aside className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-600/10 p-3 text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đăng nhập với</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.username}</p>
                </div>
              </div>
              <dl className="mt-6 space-y-3 text-sm text-gray-600">
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Thư điện tử</dt>
                  <dd className="font-medium">{profile.email}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Trạng thái</dt>
                  <dd className="font-medium">{toUserStatusLabel(profile.status)}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Vai trò</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {profile.roles?.length > 0 ? (
                      profile.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                        >
                          {toRoleLabel(role)}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">{toRoleLabel('viewer')}</span>
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
                  Đăng xuất
                </button>
                <button
                  type="button"
                  onClick={bootstrapProfile}
                  disabled={isLoadingProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <RefreshCw size={16} className={isLoadingProfile ? 'animate-spin' : ''} />
                  Làm mới dữ liệu
                </button>
              </div>
            </aside>

            <form onSubmit={handleProfileSubmit} className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                <p className="text-sm text-gray-500">Cập nhật thông tin liên hệ cơ bản dùng cho trải nghiệm người hâm mộ.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Tên
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
                  Họ
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
                Địa chỉ email
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
                <h3 className="text-lg font-semibold text-gray-900">Mật khẩu</h3>
                <p className="text-sm text-gray-500">Để trống nếu bạn không muốn đổi mật khẩu.</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                    Mật khẩu mới
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
                    Xác nhận mật khẩu
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
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu hồ sơ'
                  )}
                </button>
                <button
                  type="button"
                  onClick={bootstrapProfile}
                  disabled={isLoadingProfile}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Làm mới
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <form onSubmit={handleLoginSubmit} className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Đăng nhập để tiếp tục</h2>
              <p className="text-sm text-gray-500">
                Dùng tài khoản bạn đã tạo khi đăng ký để truy cập trang người xem.
              </p>

              <label className="mt-6 flex flex-col gap-1 text-sm font-medium text-gray-700">
                Tên đăng nhập
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
                Mật khẩu
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
                {isAuthenticating ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <p className="mt-4 text-xs text-gray-500">
                Tài khoản người xem dùng chung dịch vụ xác thực với quản trị viên nhưng chỉ nhận vai trò `viewer`, nên chỉ truy cập được các API công khai.
              </p>
            </form>

            <div className="lg:col-span-2 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
              <h3 className="text-xl font-semibold">Vì sao nên hoàn thiện hồ sơ?</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-1" />
                  Truy cập an toàn cho các tính năng bóng đá ảo, trò chơi và vé.
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-1" />
                  Cập nhật thông tin liên hệ dùng cho thông báo.
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-1" />
                  Dễ dàng nâng vai trò cao hơn khi được quản trị viên mời.
                </li>
              </ul>
              <p className="mt-4 text-xs text-blue-100">
                Chưa có tài khoản?{' '}
                <a href="/register" className="font-semibold text-white underline">
                  Tạo tại đây
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
