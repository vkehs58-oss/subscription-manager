import { useState, useCallback, useMemo } from 'react'
import data from '../../subscriptions.json'
import type { SubscriptionData, MySubscription } from '../types'
import { storage } from '../lib/platform'

const STORAGE_KEY = 'mySubscriptions'

export const subscriptionData = data as SubscriptionData

export function useSubscriptions() {
  const [mySubscriptions, setMySubscriptions] = useState<MySubscription[]>(() => {
    const saved = storage.get(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  const save = useCallback((subs: MySubscription[]) => {
    setMySubscriptions(subs)
    storage.set(STORAGE_KEY, JSON.stringify(subs))
  }, [])

  const toggle = useCallback((sub: MySubscription) => {
    setMySubscriptions(prev => {
      const exists = prev.find(
        s => s.serviceId === sub.serviceId && s.planName === sub.planName
      )
      const next = exists
        ? prev.filter(s => !(s.serviceId === sub.serviceId && s.planName === sub.planName))
        : [...prev, sub]
      storage.set(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const remove = useCallback((serviceId: string, planName: string) => {
    setMySubscriptions(prev => {
      const next = prev.filter(s => !(s.serviceId === serviceId && s.planName === planName))
      storage.set(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isSubscribed = useCallback((serviceId: string, planName: string) =>
    mySubscriptions.some(s => s.serviceId === serviceId && s.planName === planName),
    [mySubscriptions]
  )

  const update = useCallback((subs: MySubscription[]) => {
    save(subs)
  }, [save])

  return {
    mySubscriptions,
    subscriptionData,
    toggle,
    remove,
    isSubscribed,
    update,
    save,
  }
}
