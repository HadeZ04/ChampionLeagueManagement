/**
 * Service to handle Team Invitations (for Team Admin role)
 * Using native fetch and direct token injection as requested.
 */

export async function getMyInvitations(token) {
    const res = await fetch('/api/teams/me/invitations', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    // Basic error handling
    if (!res.ok) {
        let errorMsg = 'Failed to fetch invitations'
        try {
            const errorData = await res.json()
            if (errorData.error) errorMsg = errorData.error
        } catch (_) {
            // ignore
        }
        throw new Error(errorMsg)
    }

    const json = await res.json()
    return json.data
}

export async function respondToInvitation(invitationId, status, responseNotes, token) {
    if (!invitationId) throw new Error('Invitation ID is required')
    if (!['accepted', 'declined'].includes(status)) {
        throw new Error('Invalid status. utilize accepted or declined')
    }

    const payload = { status, responseNotes }

    const res = await fetch(`/api/invitations/${invitationId}/respond`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        let errorMsg = 'Failed to respond'
        try {
            const errorData = await res.json()
            if (errorData.error) errorMsg = errorData.error
        } catch (_) {
            // ignore
        }
        throw new Error(errorMsg)
    }

    return res.json()
}
