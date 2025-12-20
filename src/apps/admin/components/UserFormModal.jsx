import React, { useState, useEffect } from 'react'

const UserFormModal = ({ isOpen, onClose, onSave, user, roles, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
    password: ''
  })
  const [errors, setErrors] = useState([])

  const isEditing = !!user

  useEffect(() => {
    if (isOpen) {
      setErrors([])
      if (isEditing) {
        setFormData({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId ?? '',
          password: ''
        })
      } else {
        setFormData({ username: '', email: '', firstName: '', lastName: '', roleId: '', password: '' })
      }
    }
  }, [user, isEditing, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationMessages = []
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      validationMessages.push('First and last name are required.')
    }
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      validationMessages.push('A valid email is required.')
    }
    if (!isEditing && !formData.username.trim()) {
      validationMessages.push('Username is required.')
    }
    if (!formData.roleId) {
      validationMessages.push('Select a role.')
    }
    if (!isEditing || formData.password) {
      const pwd = formData.password
      if (!pwd || pwd.length < 8) {
        validationMessages.push('Password must be at least 8 characters.')
      }
      if (pwd && (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd))) {
        validationMessages.push('Password must include upper, lower, and a number.')
      }
    }

    if (validationMessages.length > 0) {
      setErrors(validationMessages)
      return
    }
    setErrors([])
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit User' : 'Add New User'}</h2>
        {errors.length > 0 && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-5">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="p-2 border rounded" required />
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded" required />
          </div>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-2 border rounded"
            required
            disabled={isEditing}
          />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" required />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
            className="w-full p-2 border rounded"
            required={!isEditing}
          />
          <select name="roleId" value={formData.roleId} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserFormModal
