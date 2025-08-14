import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createDirectInvitation,
  createLinkInvitation,
  previewInvitation,
  actOnInvite,
  listMyInvitations,
  listGroupInvitations,
  revokeInvitation,
  actDirectInvitation
} from '@/api/invitations'
import type {
  CreateDirectInvitationBody,
  CreateLinkInvitationBody,
  InvitationPreviewResponse,
  MyInvitesItem,
  GroupInvitationAdminItem,
  ActOnInviteResult,
} from '@/types/invitations'
import { isNeedsAuth } from '@/types/invitations' // 👈 centralisé

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return 'Une erreur est survenue'
  }
}

export const useInvitationsStore = defineStore('invitations', () => {
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const myInvitations = ref<MyInvitesItem[]>([])
  const groupInvitations = ref<Record<string, GroupInvitationAdminItem[]>>({})
  const preview = ref<InvitationPreviewResponse | null>(null)

  function setLoading(v: boolean) {
    isLoading.value = v
  }
  function setError(msg: string | null) {
    errorMessage.value = msg
  }
  function setSuccess(msg: string | null) {
    successMessage.value = msg
  }

  async function sendDirect(groupId: string, body: CreateDirectInvitationBody) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await createDirectInvitation(groupId, body)
      setSuccess(body.joinAuto ? 'Membre ajouté au groupe' : 'Invitation envoyée')
      return res
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors de la création de l’invitation')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function createLink(groupId: string, body: CreateLinkInvitationBody) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await createLinkInvitation(groupId, body)
      setSuccess('Lien d’invitation créé')
      return res
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors de la création du lien')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function loadPreview(token: string) {
    setLoading(true)
    setError(null)
    try {
      preview.value = await previewInvitation(token)
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors du chargement de l’invitation')
      preview.value = null
    } finally {
      setLoading(false)
    }
  }

  async function act(token: string, action: 'accept' | 'decline'): Promise<ActOnInviteResult> {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await actOnInvite(token, { action }) // -> ActOnInviteResult
      if (isNeedsAuth(res)) return res
      setSuccess(action === 'accept' ? 'Invitation acceptée' : 'Invitation refusée')
      return res
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors de l’action sur l’invitation')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function loadMine() {
    setLoading(true)
    setError(null)
    try {
      const res = await listMyInvitations()
      console.debug('[store] loadMine ->', res)
      myInvitations.value = res.invitations
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors du chargement des invitations')
    } finally {
      setLoading(false)
    }
  }

  async function loadForGroup(groupId: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await listGroupInvitations(groupId)
      groupInvitations.value[groupId] = res.invitations
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors du chargement des invitations du groupe')
    } finally {
      setLoading(false)
    }
  }

  async function revoke(groupId: string, invitationId: string) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await revokeInvitation(groupId, invitationId)
      groupInvitations.value[groupId] = (groupInvitations.value[groupId] || []).map((i) =>
        i.id === invitationId ? { ...i, status: 'REVOKED' } : i,
      )
      setSuccess('Invitation révoquée')
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors de la révocation')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function actDirect(invitationId: string, action: 'accept' | 'decline') {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await actDirectInvitation(invitationId, action)
      setSuccess(action === 'accept' ? 'Invitation acceptée' : 'Invitation refusée')

      // MAJ optimiste des listes admin déjà chargées
      for (const [gid, list] of Object.entries(groupInvitations.value)) {
        groupInvitations.value[gid] = (list || []).map((i) =>
          i.id === invitationId
            ? { ...i, status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' }
            : i,
        )
      }

      // Rafraîchir la bannière “mes invitations”
      await loadMine()
      return { ok: true }
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erreur lors de l’action')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    isLoading,
    errorMessage,
    successMessage,
    myInvitations,
    groupInvitations,
    preview,
    sendDirect,
    createLink,
    loadPreview,
    act,
    loadMine,
    loadForGroup,
    revoke,
    setError,
    setSuccess,
    actDirect,
    setLoading,
  }
})
