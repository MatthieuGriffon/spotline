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
  actDirectInvitation,
  createQR as apiCreateQR,
} from '@/api/invitations'
import type {
  CreateDirectInvitationBody,
  CreateLinkInvitationBody,
  InvitationPreviewResponse,
  MyInvitesItem,
  GroupInvitationAdminItem,
  ActOnInviteResult,
} from '@/types/invitations'
import { isNeedsAuth } from '@/types/invitations'

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
  // --- state ---
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const myInvitations = ref<MyInvitesItem[]>([])
  const groupInvitations = ref<Record<string, GroupInvitationAdminItem[]>>({})
  const preview = ref<InvitationPreviewResponse | null>(null)

  // --- setters ---
  function setLoading(v: boolean) {
    isLoading.value = v
  }
  function setError(msg: string | null) {
    errorMessage.value = msg
  }
  function setSuccess(msg: string | null) {
    successMessage.value = msg
  }

  // --- helper pour DRY ---
  async function wrapAsync<T>(
    fn: () => Promise<T>,
    { successMsg }: { successMsg?: string } = {},
  ): Promise<T> {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fn()
      if (successMsg) setSuccess(successMsg)
      return res
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // --- Actions ---
  async function sendDirect(groupId: string, body: CreateDirectInvitationBody) {
    return wrapAsync(() => createDirectInvitation(groupId, body), {
      successMsg: body.joinAuto ? 'Membre ajouté au groupe' : 'Invitation envoyée',
    })
  }

  async function createLink(groupId: string, body: CreateLinkInvitationBody) {
    return wrapAsync(() => createLinkInvitation(groupId, body), {
      successMsg: 'Lien d’invitation créé',
    })
  }

  async function createQR(
    groupId: string,
    body: { expiresInDays: number; maxUses: number; format?: 'png' | 'svg' },
  ): Promise<string> {
    return wrapAsync(() => apiCreateQR(groupId, body), { successMsg: 'QR code généré' })
  }

  async function loadPreview(token: string) {
    setLoading(true)
    setError(null)
    try {
      preview.value = await previewInvitation(token)
    } catch (err) {
      setError(getErrorMessage(err))
      preview.value = null
    } finally {
      setLoading(false)
    }
  }

  async function act(token: string, action: 'accept' | 'decline'): Promise<ActOnInviteResult> {
    return wrapAsync(async () => {
      const res = await actOnInvite(token, { action })
      if (isNeedsAuth(res)) return res
      setSuccess(action === 'accept' ? 'Invitation acceptée' : 'Invitation refusée')
      return res
    })
  }

  async function loadMine() {
    return wrapAsync(async () => {
      const res = await listMyInvitations()
      myInvitations.value = res.invitations
      return res
    })
  }

  async function loadForGroup(groupId: string) {
    return wrapAsync(async () => {
      const res = await listGroupInvitations(groupId)
      groupInvitations.value[groupId] = res.invitations
      return res
    })
  }

  async function revoke(groupId: string, invitationId: string) {
    return wrapAsync(
      async () => {
        await revokeInvitation(groupId, invitationId)
        groupInvitations.value[groupId] = (groupInvitations.value[groupId] || []).map((i) =>
          i.id === invitationId ? { ...i, status: 'REVOKED' } : i,
        )
      },
      { successMsg: 'Invitation révoquée' },
    )
  }

  async function actDirect(invitationId: string, action: 'accept' | 'decline') {
    return wrapAsync(
      async () => {
        await actDirectInvitation(invitationId, action)
        // MAJ optimiste
        for (const [gid, list] of Object.entries(groupInvitations.value)) {
          groupInvitations.value[gid] = (list || []).map((i) =>
            i.id === invitationId
              ? { ...i, status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' }
              : i,
          )
        }
        await loadMine()
      },
      { successMsg: action === 'accept' ? 'Invitation acceptée' : 'Invitation refusée' },
    )
  }

  return {
    // state
    isLoading,
    errorMessage,
    successMessage,
    myInvitations,
    groupInvitations,
    preview,
    // setters
    setError,
    setSuccess,
    setLoading,
    // actions
    sendDirect,
    createLink,
    createQR,
    loadPreview,
    act,
    loadMine,
    loadForGroup,
    revoke,
    actDirect,
  }
})
