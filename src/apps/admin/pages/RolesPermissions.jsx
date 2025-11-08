import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Shield, CheckCircle2, AlertCircle, Save, RefreshCw, ShieldCheck, Lock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import RoleService from '../../../layers/application/services/RoleService'
import PermissionService from '../../../layers/application/services/PermissionService'

const RolesPermissions = () => {
  const [roles, setRoles] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [permissionCatalog, setPermissionCatalog] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshingAssignments, setIsRefreshingAssignments] = useState(false)

  const loadReferenceData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [roleList, permissionList] = await Promise.all([
        RoleService.listRoles(),
        PermissionService.listPermissions()
      ])
      setRoles(roleList)
      setPermissionCatalog(permissionList)
      if (roleList.length > 0) {
        setSelectedRoleId((prev) => prev ?? roleList[0].id)
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to load roles or permission catalog.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadAssignments = useCallback(
    async (roleId) => {
      if (!roleId) {
        setSelectedPermissions([])
        return
      }
      setIsRefreshingAssignments(true)
      try {
        const assignments = await RoleService.getRolePermissions(roleId)
        setSelectedPermissions(assignments.map((permission) => permission.id))
      } catch (error) {
        console.error(error)
        toast.error('Unable to load assigned permissions.')
        setSelectedPermissions([])
      } finally {
        setIsRefreshingAssignments(false)
      }
    },
    []
  )

  useEffect(() => {
    loadReferenceData()
  }, [loadReferenceData])

  useEffect(() => {
    if (selectedRoleId) {
      loadAssignments(selectedRoleId)
    }
  }, [selectedRoleId, loadAssignments])

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  )

  const togglePermission = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    )
  }

  const handleSelectAll = () => {
    setSelectedPermissions(permissionCatalog.map((permission) => permission.id))
  }

  const handleClearAll = () => {
    setSelectedPermissions([])
  }

  const handleSave = async () => {
    if (!selectedRoleId) {
      return
    }
    setIsSaving(true)
    try {
      await RoleService.setRolePermissions(selectedRoleId, selectedPermissions)
      toast.success('Permissions updated for role.')
    } catch (error) {
      console.error(error)
      toast.error('Unable to update role permissions.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Shield size={16} />
            Access governance
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Roles & permissions</h1>
          <p className="text-sm text-gray-600">
            Keep least-privilege enforced by mapping each admin role to the granular permissions exposed by the API.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadReferenceData}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh catalog
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedRoleId || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900">Role catalog</p>
              <p className="text-xs text-gray-500">Select a role to manage its permission map</p>
            </div>
            <ul className="max-h-[480px] divide-y divide-gray-100 overflow-y-auto">
              {isLoading && (
                <li className="px-5 py-4 text-sm text-gray-500">Loading roles...</li>
              )}
              {!isLoading &&
                roles.map((role) => (
                  <li key={role.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`flex w-full items-start gap-3 px-5 py-4 text-left transition ${
                        selectedRoleId === role.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <ShieldCheck
                        size={18}
                        className={
                          selectedRoleId === role.id ? 'text-blue-600' : 'text-gray-400'
                        }
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {role.name}{' '}
                          {role.isSystemRole && (
                            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                              System
                            </span>
                          )}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{role.code}</p>
                      </div>
                    </button>
                  </li>
                ))}
              {!isLoading && roles.length === 0 && (
                <li className="px-5 py-4 text-sm text-gray-500">No roles found.</li>
              )}
            </ul>
          </div>
        </aside>

        <div className="lg:col-span-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            {!selectedRole && (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                <AlertCircle size={18} />
                Select a role from the left column to view its permissions.
              </div>
            )}

            {selectedRole && (
              <>
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{selectedRole.name}</p>
                    <p className="text-sm text-gray-500">
                      Manage permissions for <span className="font-mono">{selectedRole.code}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                      <CheckCircle2 size={14} />
                      {selectedPermissions.length} granted
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
                      <Lock size={14} />
                      {permissionCatalog.length - selectedPermissions.length} restricted
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    disabled={permissionCatalog.length === 0}
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    disabled={selectedPermissions.length === 0}
                  >
                    Clear all
                  </button>
                  {isRefreshingAssignments && (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
                      <RefreshCw size={14} className="animate-spin" />
                      Syncing assignments...
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {permissionCatalog.map((permission) => {
                    const isChecked = selectedPermissions.includes(permission.id)
                    return (
                      <label
                        key={permission.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                          isChecked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isChecked}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{permission.name}</p>
                          <p className="text-xs uppercase tracking-wide text-gray-400">{permission.code}</p>
                          {permission.description && (
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                  {!isLoading && permissionCatalog.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                      No permissions were found in the catalog. Seed permissions before mapping them to roles.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default RolesPermissions
