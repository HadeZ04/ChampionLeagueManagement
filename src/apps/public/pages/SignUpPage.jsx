import React, { useState } from 'react'
import RegistrationService from '../../../layers/application/services/RegistrationService'

const initialState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: ''
}

const SignUpPage = () => {
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
      setFeedback({
        type: 'success',
        message: 'Account created successfully. You can now sign in to personalize your public experience.'
      })
      setFormData(initialState)
    } catch (error) {
      const message = error?.message ?? 'Unable to create the account. Please try again.'
      setFeedback({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="uefa-container max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-uefa-dark mb-2">Create your UEFA account</h1>
        <p className="text-uefa-gray mb-8">
          This signup flow is only for fan-facing experiences. Newly created users receive the viewer role and cannot
          access the admin dashboard.
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
              <label className="block text-sm font-medium text-uefa-dark mb-1">First name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-uefa-blue focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-uefa-dark mb-1">Last name</label>
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
            <label className="block text-sm font-medium text-uefa-dark mb-1">Username</label>
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
            <label className="block text-sm font-medium text-uefa-dark mb-1">Email</label>
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
            <label className="block text-sm font-medium text-uefa-dark mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-uefa-blue focus:outline-none"
              required
            />
            <p className="text-xs text-uefa-gray mt-1">Password must contain at least 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-uefa-blue py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignUpPage
