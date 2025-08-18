import { actOnInvite } from '@/api/invitations'
import { useGroupsStore } from '@/stores/useGroupsStore'
import { useInvitationsStore } from '@/stores/invitationsStore'
import { useBannerStore } from '@/stores/bannerStore'
import type { ActOnInviteResult } from '@/types/invitations'

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
    const result: ActOnInviteResult = await actOnInvite(token, { action: 'accept' })

    // Cas "besoin d’authentification"
    if ('needsAuth' in result && result.needsAuth) {
      console.warn('[checkPendingInvite] Invitation nécessite une connexion')
      return null
    }

    // Cas "refusé ou invalide"
    if ('ok' in result && !result.ok) {
      console.warn('[checkPendingInvite] Invitation invalide ou déjà utilisée')
      return null
    }

    // Cas accepté
    if ('ok' in result && result.ok) {
      const groupsStore = useGroupsStore()
      const invitationsStore = useInvitationsStore()
      await Promise.all([groupsStore.loadGroups(), invitationsStore.loadMine()])

      if (result.groupName) {
        console.log('[checkPendingInvite] setRecentJoin avec', result.groupName)
        const bannerStore = useBannerStore()
        bannerStore.setRecentJoin(result.groupName)
      }

      return result.groupId ?? null
    }

    return null
  } catch (err) {
    console.error('[checkPendingInvite] Erreur', err)
    return null
  } finally {
    if (!tokenFromUrl) {
      localStorage.removeItem('pendingInvite')
    }
  }
}
