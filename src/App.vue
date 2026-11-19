<script setup lang="ts">
import { provide } from 'vue'
import { SoundEngine } from './audio/soundEngine'
import { useSound } from './audio/useSound'
import { SESSION_KEY } from './game/sessionKey'
import { useAutoPause } from './game/useAutoPause'
import { useGameSession, type SessionDeps } from './game/useGameSession'
import { useKeyboardControls } from './game/useKeyboardControls'
import { createUpdateState, type UpdateState } from './pwa/updateState'
import { useHighScores, type HighScores } from './storage/useHighScores'
import HudRecord from './ui/hud/HudRecord.vue'
import SoundToggle from './ui/hud/SoundToggle.vue'
import HighScoreResults from './ui/scores/HighScoreResults.vue'
import HomeHighScores from './ui/scores/HomeHighScores.vue'
import GameScreen from './ui/screens/GameScreen.vue'
import HomeScreen from './ui/screens/HomeScreen.vue'

const props = defineProps<{ sessionDeps?: SessionDeps; highScores?: HighScores; updates?: UpdateState }>()

const session = useGameSession(props.sessionDeps)
const { status } = session
provide(SESSION_KEY, session)
useKeyboardControls(session)
useAutoPause(session)
const sound = useSound(session, new SoundEngine())
const { muted } = sound
const highScores = props.highScores ?? useHighScores()
const { best } = highScores
const { updateReady, applyUpdate } = props.updates ?? createUpdateState()
</script>

<template>
  <HomeScreen
    v-if="status === 'home'"
    :update-ready="updateReady"
    @play="session.start()"
    @reload="applyUpdate()"
  >
    <HomeHighScores :high-scores="highScores" />
  </HomeScreen>
  <GameScreen v-else>
    <template #hud-actions>
      <SoundToggle
        :muted="muted"
        @toggle="sound.toggle()"
      />
    </template>
    <template #hud-record="{ score }">
      <HudRecord
        :best="best"
        :score="score"
      />
    </template>
    <template #results="{ score, level }">
      <HighScoreResults
        :score="score"
        :level="level"
        :high-scores="highScores"
      />
    </template>
  </GameScreen>
</template>
