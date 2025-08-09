// Pending tests for new R1 services (skills, badges, experience, media)
// Marked with describe.skip until real DB + RPC ready

import { describe, it, expect } from 'vitest'
import { skillsService } from '../../services/skills.service.js'
import { badgesService } from '../../services/badges.service.js'
import { experienceService } from '../../services/experience.service.js'
import { mediaService } from '../../services/media.service.js'

const DEMO_USER = 'demo-user-1'

describe.skip('skillsService', () => {
  it('list returns array', async () => {
    const { data, error } = await skillsService.list(DEMO_USER)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe.skip('badgesService', () => {
  it('list returns array', async () => {
    const { data, error } = await badgesService.list(DEMO_USER)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe.skip('experienceService', () => {
  it('list returns array', async () => {
    const { data, error } = await experienceService.list(DEMO_USER)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe.skip('mediaService', () => {
  it('upload mock returns url in demo mode', async () => {
    const fakeFile = { name: 'demo.mp4' }
    const { data, error } = await mediaService.uploadProfileVideo(DEMO_USER, fakeFile)
    expect(error).toBeNull()
    expect(data.url).toContain('demo')
  })
})
