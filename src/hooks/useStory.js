import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Hook for managing persona fan fiction story chapters
 * Each user gets a continuous story that progresses every 3-day reflection
 */
export function useStory() {
  const { user, isOnline } = useAuth()
  const [loading, setLoading] = useState(true)
  const [latestChapter, setLatestChapter] = useState(null)
  const [previousSummary, setPreviousSummary] = useState(null)
  const [chapterNumber, setChapterNumber] = useState(1)

  // Fetch the latest chapter and determine next chapter number
  const fetchLatestChapter = useCallback(async () => {
    if (!user?.id || !isOnline) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('story_chapters')
        .select('*')
        .eq('user_id', user.id)
        .order('chapter_number', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setLatestChapter(data)
        setPreviousSummary(data.summary)
        setChapterNumber(data.chapter_number + 1)
      } else {
        // First chapter
        setChapterNumber(1)
        setPreviousSummary(null)
      }
    } catch (err) {
      console.error('Failed to fetch story chapter:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, isOnline])

  useEffect(() => {
    fetchLatestChapter()
  }, [fetchLatestChapter])

  // Save a new chapter
  const saveChapter = useCallback(async (content, summary) => {
    if (!user?.id || !isOnline) return null

    try {
      const { data, error } = await supabase
        .from('story_chapters')
        .insert({
          user_id: user.id,
          chapter_number: chapterNumber,
          content,
          summary,
        })
        .select()
        .single()

      if (error) throw error

      setLatestChapter(data)
      setPreviousSummary(summary)
      setChapterNumber(chapterNumber + 1)

      return data
    } catch (err) {
      console.error('Failed to save story chapter:', err)
      return null
    }
  }, [user?.id, isOnline, chapterNumber])

  // Get all chapter summaries for "previously on..." display
  const getAllSummaries = useCallback(async () => {
    if (!user?.id || !isOnline) return []

    try {
      const { data, error } = await supabase
        .from('story_chapters')
        .select('chapter_number, summary')
        .eq('user_id', user.id)
        .order('chapter_number', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Failed to fetch summaries:', err)
      return []
    }
  }, [user?.id, isOnline])

  return {
    loading,
    chapterNumber,
    previousSummary,
    latestChapter,
    saveChapter,
    getAllSummaries,
    isFirstChapter: chapterNumber === 1,
  }
}
