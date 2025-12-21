import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationService from '../../../layers/application/services/RegistrationService'

const initialState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: ''
}

const SignUpPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: null, message: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback({ type: null, message: '' })
    try {
      await RegistrationService.register(formData)
      setFormData(initialState)
      navigate('/login', {
        replace: true,
        state: {
          registrationSuccess: true,
          username: formData.username
        }
      })
    } catch (error) {
      const message = error?.message ?? 'Không thể tạo tài khoản. Vui lòng thử lại.'
      setFeedback({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="uefa-container max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-uefa-dark mb-2">Tạo tài khoản</h1>
        <p className="text-uefa-gray mb-8">
          Trang đăng ký này dành cho người dùng. Tài khoản mới sẽ có vai trò người xem và không thể truy cập khu vực quản trị.
        </p>

        {feedback.type && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-uefa-dark mb-1">Họ</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-uefa-blue focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-uefa-dark mb-1">Tên</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-uefa-blue focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-uefa-dark mb-1">Tên đăng nhập</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              minLength={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-uefa-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-uefa-dark mb-1">Địa chỉ email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-uefa-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-uefa-dark mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-uefa-blue focus:outline-none"
              required
            />
            <p className="text-xs text-uefa-gray mt-1">Mật khẩu phải có ít nhất 8 ký tự.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-uefa-blue py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignUpPage
