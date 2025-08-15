import { previewInvitation, actOnInvite } from '@/api/invitations'
import { useGroupsStore } from '@/stores/useGroupsStore'
import { useInvitationsStore } from '@/stores/invitationsStore'
import { useBannerStore } from '@/stores/bannerStore'

export async function checkPendingInvite(tokenFromUrl?: string): Promise<string | null> {
  let token = tokenFromUrl
  let expires: number | undefined

  if (!token) {
    const stored = localStorage.getItem('pendingInvite')
    if (!stored) return null

    try {
      const parsed = JSON.parse(stored)
      token = parsed.token
      expires = parsed.expires
    } catch {
      localStorage.removeItem('pendingInvite')
      return null
    }

    if (!token || !expires || Date.now() > expires) {
      localStorage.removeItem('pendingInvite')
      return null
    }
  }

  try {
    let groupId: string | null = null
    let groupName = ''

    try {
      const preview = await previewInvitation(token)
      groupName = preview.group?.name || ''
      groupId = preview.group?.id || null
    } catch (e) {
      console.warn('[checkPendingInvite] Impossible de récupérer le nom du groupe', e)
    }

    await actOnInvite(token, { action: 'accept' })

    const groupsStore = useGroupsStore()
    const invitationsStore = useInvitationsStore()
    await Promise.all([groupsStore.loadGroups(), invitationsStore.loadMine()])

    if (groupName) {
      const bannerStore = useBannerStore()
      bannerStore.setRecentJoin(groupName)
    }

    return groupId
  } catch (err) {
    console.error('[checkPendingInvite] Erreur', err)
    return null
  } finally {
    // On nettoie seulement si ça vient du localStorage
    if (!tokenFromUrl) {
      localStorage.removeItem('pendingInvite')
    }
  }
}
