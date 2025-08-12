import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchMyGroups,
  createGroup,
  deleteGroup,
  fetchGroupDetails,
  updateGroup,
  leaveGroup,
  inviteUserToGroup,
  changeMemberRole,
  removeMemberFromGroup,
} from '@/api/groups'
import type { Group, GroupDetails, GroupRole } from '@/types/groups'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])
  const currentGroup = ref<GroupDetails | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  function setLoading(state: boolean) {
    isLoading.value = state
  }

  function setError(message: string | null) {
    errorMessage.value = message
  }

  function setSuccess(message: string | null) {
    successMessage.value = message
  }

  // 📋 Charger tous les groupes
  async function loadGroups() {
    setLoading(true)
    setError(null)
    try {
      groups.value = await fetchMyGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des groupes')
    } finally {
      setLoading(false)
    }
  }

  // ➕ Créer un groupe
 async function addGroup(name: string, description?: string) {
   setLoading(true)
   setError(null)
   setSuccess(null)
   try {
     await createGroup(name, description)
     await loadGroups() // ← re-fetch côté store
     setSuccess('Groupe créé avec succès')
   } catch (err) {
     setError(err instanceof Error ? err.message : 'Erreur lors de la création du groupe')
   } finally {
     setLoading(false)
   }
 }

  // 🗑 Supprimer un groupe
 async function removeGroup(groupId: string) {
   setLoading(true)
   setError(null)
   setSuccess(null)
   try {
     await deleteGroup(groupId)
     await loadGroups() // ← re-fetch côté store
     setSuccess('Groupe supprimé avec succès')
   } catch (err) {
     setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du groupe')
   } finally {
     setLoading(false)
   }
 }
  // 📄 Charger les détails d'un groupe
  async function loadGroupDetails(groupId: string) {
    setLoading(true)
    setError(null)
    try {
      currentGroup.value = await fetchGroupDetails(groupId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du groupe')
    } finally {
      setLoading(false)
    }
  }

  // ✏️ Mettre à jour un groupe
  async function editGroup(groupId: string, name: string, description?: string) {
    setLoading(true)
    setError(null)
    try {
      const updatedDetail = await updateGroup(groupId, name, description)
      currentGroup.value = updatedDetail
      await loadGroups() // <- évite tout mismatch de shape
      setSuccess('Groupe mis à jour avec succès')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du groupe')
    } finally {
      setLoading(false)
    }
  }

  // 🚪 Quitter un groupe
  async function leaveGroupAction(groupId: string) {
    setLoading(true)
    setError(null)
    try {
      await leaveGroup(groupId)
      groups.value = groups.value.filter((g) => g.id !== groupId)
      setSuccess('Vous avez quitté le groupe')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du départ du groupe')
    } finally {
      setLoading(false)
    }
  }

  // 📩 Inviter un utilisateur
  async function inviteUser(groupId: string, userId: string, role: GroupRole) {
    setLoading(true)
    setError(null)
    try {
      await inviteUserToGroup(groupId, userId, role)
      setSuccess('Utilisateur invité avec succès')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’invitation')
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Changer le rôle d’un membre
  async function changeRole(groupId: string, userId: string, role: GroupRole) {
    setLoading(true)
    setError(null)
    try {
      await changeMemberRole(groupId, userId, role)
      if (currentGroup.value) {
        const member = currentGroup.value.members.find((m) => m.userId === userId)
        if (member) member.role = role
      }
      setSuccess('Rôle modifié avec succès')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de rôle')
    } finally {
      setLoading(false)
    }
  }

  // ❌ Retirer un membre
  async function removeMember(groupId: string, userId: string) {
    setLoading(true)
    setError(null)
    try {
      await removeMemberFromGroup(groupId, userId)
      if (currentGroup.value) {
        currentGroup.value.members = currentGroup.value.members.filter((m) => m.userId !== userId)
      }
      setSuccess('Membre retiré avec succès')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du membre')
    } finally {
      setLoading(false)
    }
  }

  return {
    groups,
    currentGroup,
    isLoading,
    errorMessage,
    successMessage,
    loadGroups,
    addGroup,
    removeGroup,
    loadGroupDetails,
    editGroup,
    leaveGroupAction,
    inviteUser,
    changeRole,
    removeMember,
  }
})
