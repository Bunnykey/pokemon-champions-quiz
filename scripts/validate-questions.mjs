import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { Dex } from '@pkmn/dex'

const RETRIEVED_AT = '2026-05-08'
const REGULATION_URL =
  'https://champions-news.pokemon-home.com/en/page/751.html'
const ELIGIBLE_EN_URL =
  'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/en/pokemon.html'
const ELIGIBLE_KO_URL =
  'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/ko/pokemon.html'

const DIFFICULTIES = ['입문', '초급', '중급', '상급', '전문가']

const TYPE_LABELS = {
  Normal: '노말',
  Fire: '불꽃',
  Water: '물',
  Electric: '전기',
  Grass: '풀',
  Ice: '얼음',
  Fighting: '격투',
  Poison: '독',
  Ground: '땅',
  Flying: '비행',
  Psychic: '에스퍼',
  Bug: '벌레',
  Rock: '바위',
  Ghost: '고스트',
  Dragon: '드래곤',
  Dark: '악',
  Steel: '강철',
  Fairy: '페어리',
}

const ATTACK_CHART = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: {
    Fire: 0.5,
    Water: 0.5,
    Grass: 2,
    Ice: 2,
    Bug: 2,
    Rock: 0.5,
    Dragon: 0.5,
    Steel: 2,
  },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: {
    Water: 2,
    Electric: 0.5,
    Grass: 0.5,
    Ground: 0,
    Flying: 2,
    Dragon: 0.5,
  },
  Grass: {
    Fire: 0.5,
    Water: 2,
    Grass: 0.5,
    Poison: 0.5,
    Ground: 2,
    Flying: 0.5,
    Bug: 0.5,
    Rock: 2,
    Dragon: 0.5,
    Steel: 0.5,
  },
  Ice: {
    Fire: 0.5,
    Water: 0.5,
    Grass: 2,
    Ice: 0.5,
    Ground: 2,
    Flying: 2,
    Dragon: 2,
    Steel: 0.5,
  },
  Fighting: {
    Normal: 2,
    Ice: 2,
    Poison: 0.5,
    Flying: 0.5,
    Psychic: 0.5,
    Bug: 0.5,
    Rock: 2,
    Ghost: 0,
    Dark: 2,
    Steel: 2,
    Fairy: 0.5,
  },
  Poison: {
    Grass: 2,
    Poison: 0.5,
    Ground: 0.5,
    Rock: 0.5,
    Ghost: 0.5,
    Steel: 0,
    Fairy: 2,
  },
  Ground: {
    Fire: 2,
    Electric: 2,
    Grass: 0.5,
    Poison: 2,
    Flying: 0,
    Bug: 0.5,
    Rock: 2,
    Steel: 2,
  },
  Flying: {
    Electric: 0.5,
    Grass: 2,
    Fighting: 2,
    Bug: 2,
    Rock: 0.5,
    Steel: 0.5,
  },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: {
    Fire: 0.5,
    Grass: 2,
    Fighting: 0.5,
    Poison: 0.5,
    Flying: 0.5,
    Psychic: 2,
    Ghost: 0.5,
    Dark: 2,
    Steel: 0.5,
    Fairy: 0.5,
  },
  Rock: {
    Fire: 2,
    Ice: 2,
    Fighting: 0.5,
    Ground: 0.5,
    Flying: 2,
    Bug: 2,
    Steel: 0.5,
  },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: {
    Fire: 0.5,
    Water: 0.5,
    Electric: 0.5,
    Ice: 2,
    Rock: 2,
    Steel: 0.5,
    Fairy: 2,
  },
  Fairy: {
    Fire: 0.5,
    Fighting: 2,
    Poison: 0.5,
    Dragon: 2,
    Dark: 2,
    Steel: 0.5,
  },
}

const EXACT_DEX_NAMES = new Map([
  ['Rotom (Rotom)', 'Rotom'],
  ['Rotom (Heat Rotom)', 'Rotom-Heat'],
  ['Rotom (Wash Rotom)', 'Rotom-Wash'],
  ['Rotom (Frost Rotom)', 'Rotom-Frost'],
  ['Rotom (Fan Rotom)', 'Rotom-Fan'],
  ['Rotom (Mow Rotom)', 'Rotom-Mow'],
  ['Tauros (Paldean Form (Combat Breed))', 'Tauros-Paldea-Combat'],
  ['Tauros (Paldean Form (Blaze Breed))', 'Tauros-Paldea-Blaze'],
  ['Tauros (Paldean Form (Aqua Breed))', 'Tauros-Paldea-Aqua'],
  ['Meowstic (Male)', 'Meowstic'],
  ['Meowstic (Female)', 'Meowstic-F'],
  ['Gourgeist (Medium Variety)', 'Gourgeist'],
  ['Gourgeist (Small Variety)', 'Gourgeist-Small'],
  ['Gourgeist (Large Variety)', 'Gourgeist-Large'],
  ['Gourgeist (Jumbo Variety)', 'Gourgeist-Super'],
  ['Lycanroc (Midday Form)', 'Lycanroc'],
  ['Lycanroc (Midnight Form)', 'Lycanroc-Midnight'],
  ['Lycanroc (Dusk Form)', 'Lycanroc-Dusk'],
  ['Basculegion (Male)', 'Basculegion'],
  ['Basculegion (Female)', 'Basculegion-F'],
])

const EXACT_POKEAPI_NAMES = new Map([
  ['Rotom (Rotom)', 'rotom'],
  ['Rotom (Heat Rotom)', 'rotom-heat'],
  ['Rotom (Wash Rotom)', 'rotom-wash'],
  ['Rotom (Frost Rotom)', 'rotom-frost'],
  ['Rotom (Fan Rotom)', 'rotom-fan'],
  ['Rotom (Mow Rotom)', 'rotom-mow'],
  ['Tauros (Paldean Form (Combat Breed))', 'tauros-paldea-combat-breed'],
  ['Tauros (Paldean Form (Blaze Breed))', 'tauros-paldea-blaze-breed'],
  ['Tauros (Paldean Form (Aqua Breed))', 'tauros-paldea-aqua-breed'],
  ['Meowstic (Male)', 'meowstic-male'],
  ['Meowstic (Female)', 'meowstic-female'],
  ['Gourgeist (Medium Variety)', 'gourgeist-average'],
  ['Gourgeist (Small Variety)', 'gourgeist-small'],
  ['Gourgeist (Large Variety)', 'gourgeist-large'],
  ['Gourgeist (Jumbo Variety)', 'gourgeist-super'],
  ['Lycanroc (Midday Form)', 'lycanroc-midday'],
  ['Lycanroc (Midnight Form)', 'lycanroc-midnight'],
  ['Lycanroc (Dusk Form)', 'lycanroc-dusk'],
  ['Basculegion (Male)', 'basculegion-male'],
  ['Basculegion (Female)', 'basculegion-female'],
  ['Maushold', 'maushold-family-of-four'],
  ['Palafin', 'palafin-zero'],
  ['Mr. Rime', 'mr-rime'],
  ['Aegislash', 'aegislash-shield'],
  ['Mimikyu', 'mimikyu-disguised'],
  ['Morpeko', 'morpeko-full-belly'],
])

const OFFICIAL_RULE_ANSWERS = new Map([
  ['rule-mega-once', '배틀당 1회'],
  ['rule-duplicate-items', '중복 지닌 도구는 허용되지 않는다'],
  ['timer-total', '20분'],
  ['timer-player', '7분'],
  ['timer-turn', '45초'],
  ['timer-preview', '90초'],
])

const questions = JSON.parse(
  await readFile(new URL('../src/data/questions.json', import.meta.url), 'utf8'),
)

const [eligibleEn, eligibleKo, regulationHtml] = await Promise.all([
  fetchEligible(ELIGIBLE_EN_URL),
  fetchEligible(ELIGIBLE_KO_URL),
  fetchText(REGULATION_URL),
])
const allowedMegas = parseAllowedMegas(regulationHtml)
const eligiblePokemon = eligibleEn.map((entry, index) => {
  const dexName = normalizeDexName(entry.name)
  const species = Dex.species.get(dexName)
  return {
    code: entry.code,
    en: entry.name,
    ko: eligibleKo[index]?.name ?? entry.name,
    dexName,
    species,
    types: species.types ?? [],
    speed: species.baseStats?.spe ?? 0,
    abilities: Object.values(species.abilities ?? {}),
    pokeApiName: normalizePokeApiName(entry.name),
    pokeApiUrl: `https://pokeapi.co/api/v2/pokemon/${normalizePokeApiName(entry.name)}`,
  }
})

const eligibleLabelSet = new Set(eligiblePokemon.map(labelPokemon))
const codeToPokemon = new Map(eligiblePokemon.map((pokemon) => [pokemon.code, pokemon]))
const labelToPokemon = new Map(
  eligiblePokemon.flatMap((pokemon) => [
    [labelPokemon(pokemon), pokemon],
    [pokemon.en, pokemon],
  ]),
)
const allowedMegaSet = new Set(allowedMegas)
const issues = []

validateQuestionShape()
validateRuleSpecificAnswers()
const pedagogyQuality = validatePedagogyQuality()
const sourceReferenceQuality = validateSourceReferenceQuality()
const difficultyHierarchy = validateDifficultyHierarchy()
const pokeApiTypeCrossCheck = await validatePokeApiTypeCrossCheck()

const byDifficulty = Object.fromEntries(
  DIFFICULTIES.map((difficulty) => [
    difficulty,
    questions.filter((question) => question.difficulty === difficulty).length,
  ]),
)

const summary = {
  generatedAt: new Date().toISOString(),
  retrievedAt: RETRIEVED_AT,
  status: issues.length === 0 ? 'passed' : 'failed',
  totalQuestions: questions.length,
  byDifficulty,
  officialEligiblePokemon: eligiblePokemon.length,
  officialAllowedMegaEvolutions: allowedMegas.length,
  checks: {
    uniqueIds: new Set(questions.map((question) => question.id)).size,
    regulationSourceUrl: REGULATION_URL,
    eligibleSourceUrl: ELIGIBLE_KO_URL,
    ruleSpecificQuestionsChecked: questions.length,
    issues: issues.length,
  },
  pedagogyQuality,
  sourceReferenceQuality,
  difficultyHierarchy,
  pokeApiTypeCrossCheck,
  caveats: [
    'Pokémon Champions 공식 규정과 참가 가능 목록은 라이브 공식 페이지와 대조했습니다.',
    '타입 데이터는 @pkmn/dex 생성값을 독립 PokéAPI 타입 값과 교차검증했습니다.',
    '스피드와 특성 문제는 @pkmn/dex 데이터 기반이며, Champions 인게임 수치와 다를 가능성이 발견되면 blame 대상으로 처리합니다.',
    '나무위키는 공식 소스가 아니므로 자동 검증의 권위 소스로 사용하지 않았습니다.',
  ],
}

await mkdir(new URL('../src/data', import.meta.url), { recursive: true })
await mkdir(new URL('../docs', import.meta.url), { recursive: true })
await writeFile(
  new URL('../src/data/validation-summary.json', import.meta.url),
  `${JSON.stringify(summary, null, 2)}\n`,
)
await writeFile(
  new URL('../docs/validation-report.md', import.meta.url),
  renderReport(summary, issues),
)

if (issues.length > 0) {
  console.error(`Validation failed with ${issues.length} issue(s).`)
  for (const issue of issues.slice(0, 50)) {
    console.error(`- ${issue.id}: ${issue.message}`)
  }
  process.exitCode = 1
} else {
  console.log(`Validated ${questions.length} questions.`)
  console.log(`PokeAPI type cross-check: ${pokeApiTypeCrossCheck.verified}/${eligiblePokemon.length}`)
}

function validateQuestionShape() {
  const ids = new Set()
  for (const question of questions) {
    if (ids.has(question.id)) {
      addIssue(question.id, 'Duplicate question id')
    }
    ids.add(question.id)
    if (!DIFFICULTIES.includes(question.difficulty)) {
      addIssue(question.id, `Unknown difficulty ${question.difficulty}`)
    }
    if (question.choices.length !== 4) {
      addIssue(question.id, 'Question must have exactly four choices')
    }
    if (question.answerIndex < 0 || question.answerIndex > 3) {
      addIssue(question.id, 'Answer index out of range')
    }
    if (new Set(question.choices).size !== question.choices.length) {
      addIssue(question.id, 'Duplicate choices')
    }
    if (!question.promptKo || !question.explanationKo) {
      addIssue(question.id, 'Missing prompt or explanation')
    }
    if (!Array.isArray(question.sourceRefs) || question.sourceRefs.length === 0) {
      addIssue(question.id, 'Missing source refs')
    }
    for (const source of question.sourceRefs ?? []) {
      if (!source.kind || !source.label || !source.url) {
        addIssue(question.id, 'Source ref must include kind, label, and url')
      }
      if (!isHttpUrl(source.url)) {
        addIssue(question.id, `Source ref is not an http URL: ${source.url}`)
      }
    }
    if (question.focusPokemon) {
      const focus = question.focusPokemon
      if (!focus.nameKo || !focus.nameEn || !focus.pokeApiName || !focus.referenceUrl) {
        addIssue(question.id, 'Focus Pokemon metadata is incomplete')
      }
      if (focus.imageUrl && !isHttpUrl(focus.imageUrl)) {
        addIssue(question.id, `Focus Pokemon image is not an http URL: ${focus.imageUrl}`)
      }
      if (!question.sourceRefs.some((source) => source.url === focus.referenceUrl)) {
        addIssue(question.id, 'Focus Pokemon reference URL is missing from source refs')
      }
    }
  }
}

function validateRuleSpecificAnswers() {
  for (const question of questions) {
    const answer = question.choices[question.answerIndex]
    if (question.id.startsWith('type-id-')) {
      const pokemon = pokemonByCodeFromId(question.id, 'type-id-')
      expectAnswer(question, typeComboLabel(pokemon.types))
      continue
    }

    if (question.id.startsWith('eligible-pick-')) {
      const pokemon = pokemonByCodeFromId(question.id, 'eligible-pick-')
      expectAnswer(question, labelPokemon(pokemon))
      expect(eligibleLabelSet.has(answer), question, 'Answer is not in official eligible list')
      continue
    }

    if (question.id.startsWith('ineligible-trap-')) {
      expect(!eligibleLabelSet.has(answer), question, 'Trap answer is official eligible')
      for (const choice of question.choices) {
        if (choice !== answer) {
          expect(eligibleLabelSet.has(choice), question, `Distractor is not official eligible: ${choice}`)
        }
      }
      continue
    }

    if (question.id.startsWith('mega-allowed-')) {
      expect(allowedMegaSet.has(answer), question, `${answer} is not in live allowed Mega list`)
      continue
    }

    if (question.id.startsWith('mega-trap-')) {
      expect(!allowedMegaSet.has(answer), question, `${answer} is unexpectedly in live allowed Mega list`)
      for (const choice of question.choices) {
        if (choice !== answer) {
          expect(allowedMegaSet.has(choice), question, `Mega distractor not allowed: ${choice}`)
        }
      }
      continue
    }

    const ruleAnswer = officialRuleAnswer(question.id)
    if (ruleAnswer) {
      expectAnswer(question, ruleAnswer)
      expect(
        question.sourceRefs.some((source) => source.url.startsWith(REGULATION_URL)),
        question,
        'Official rule question does not reference Regulation Set M-A',
      )
      continue
    }

    if (question.id.startsWith('weakness-')) {
      const { code, typeName } = parseCodeAndType(question.id, 'weakness-')
      const pokemon = requirePokemon(code, question)
      expect(damageMultiplier(typeName, pokemon.types) > 1, question, 'Weakness answer is not super-effective')
      expectAnswer(question, typeLabel(typeName))
      continue
    }

    if (question.id.startsWith('stab-')) {
      const { code, typeName } = parseCodeAndType(question.id, 'stab-')
      const pokemon = requirePokemon(code, question)
      expect(pokemon.types.includes(typeName), question, 'STAB answer is not one of the Pokemon types')
      expectAnswer(question, typeLabel(typeName))
      continue
    }

    if (question.id.startsWith('resist-')) {
      const attackType = typeFromSlug(question.id.replace(/^resist-/, '').replace(/-\d+$/, ''))
      const answerPokemon = labelToPokemon.get(answer)
      expect(Boolean(answerPokemon), question, `Answer Pokemon not found: ${answer}`)
      if (answerPokemon) {
        expect(
          damageMultiplier(attackType, answerPokemon.types) < 1,
          question,
          'Resistance answer does not resist the attack type',
        )
      }
      continue
    }

    if (question.id.startsWith('speed-fastest-')) {
      const choicePokemon = question.choices.map((choice) => labelToPokemon.get(choice))
      expect(choicePokemon.every(Boolean), question, 'Speed choices must all be eligible Pokemon')
      const maxSpeed = Math.max(...choicePokemon.filter(Boolean).map((pokemon) => pokemon.speed))
      const answerPokemon = labelToPokemon.get(answer)
      expect(answerPokemon?.speed === maxSpeed, question, 'Answer is not fastest among choices')
      continue
    }

    if (question.id.startsWith('speed-benchmark-')) {
      const pokemon = pokemonByCodeFromId(question.id, 'speed-benchmark-')
      const answerPokemon = labelToPokemon.get(answer)
      expect(Boolean(answerPokemon), question, 'Benchmark answer Pokemon not found')
      if (answerPokemon) {
        expect(answerPokemon.speed > pokemon.speed, question, 'Benchmark answer is not faster')
      }
      continue
    }

    if (question.id.startsWith('ability-')) {
      const pokemon = pokemonByCodeFromId(question.id, 'ability-')
      expect(pokemon.abilities.includes(answer), question, 'Ability answer is not in @pkmn/dex ability set')
      continue
    }

    if (question.id.startsWith('counter-pivot-')) {
      const { code, typeName } = parseCodeAndType(question.id, 'counter-pivot-')
      const attacker = requirePokemon(code, question)
      const answerPokemon = labelToPokemon.get(answer)
      expect(Boolean(answerPokemon), question, `Counter pivot answer Pokemon not found: ${answer}`)
      if (answerPokemon) {
        expect(
          damageMultiplier(typeName, answerPokemon.types) < 1,
          question,
          'Counter pivot answer does not resist the expected attack type',
        )
        expect(
          hasStabSuperEffective(answerPokemon, attacker),
          question,
          'Counter pivot answer cannot pressure back with super-effective STAB',
        )
      }
      continue
    }

    if (question.id.startsWith('speed-pressure-')) {
      const target = pokemonByCodeFromId(question.id, 'speed-pressure-')
      const answerPokemon = labelToPokemon.get(answer)
      expect(Boolean(answerPokemon), question, `Speed pressure answer Pokemon not found: ${answer}`)
      if (answerPokemon) {
        expect(answerPokemon.speed > target.speed, question, 'Speed pressure answer is not faster than target')
        expect(
          hasStabSuperEffective(answerPokemon, target),
          question,
          'Speed pressure answer cannot pressure with super-effective STAB',
        )
      }
    }
  }
}

function validatePedagogyQuality() {
  const bannedAnyDifficultyPatterns = [
    /복습/,
    /Regulation Set M-A 시작 시각/,
    /Regulation Set M-A 종료 시각/,
    /\bUTC\b/,
    /20\d{2}-\d{2}-\d{2}/,
  ]
  const expertQuestions = questions.filter((question) => question.difficulty === '전문가')
  let bannedTextMatches = 0
  let expertPracticalQuestions = 0
  let expertOfficialTriviaQuestions = 0

  for (const question of questions) {
    const teachableText = [
      question.promptKo,
      question.explanationKo,
      ...question.choices,
    ].join(' ')
    const matchedPattern = bannedAnyDifficultyPatterns.find((pattern) =>
      pattern.test(teachableText),
    )
    if (matchedPattern) {
      bannedTextMatches += 1
      addIssue(
        question.id,
        `Non-practical quiz text matched banned pattern ${matchedPattern}`,
      )
    }

    if (question.difficulty !== '전문가') {
      continue
    }

    if (question.generatedFrom.startsWith('official-regulation')) {
      expertOfficialTriviaQuestions += 1
      addIssue(question.id, 'Expert questions must not be official regulation trivia')
    }
    if (question.tags.includes('타이머') || question.tags.includes('시즌')) {
      addIssue(question.id, 'Expert questions must not be timer or season recall')
    }
    if (!question.tags.includes('실전판단')) {
      addIssue(question.id, 'Expert questions must include 실전판단')
    }
    if (!question.tags.includes('복합판단')) {
      addIssue(question.id, 'Expert questions must include 복합판단')
    }

    const isExpertPractical =
      question.tags.includes('실전판단') &&
      question.tags.includes('복합판단') &&
      (question.tags.includes('카운터') || question.tags.includes('압박'))
    if (isExpertPractical) {
      expertPracticalQuestions += 1
    } else {
      addIssue(question.id, 'Expert questions must combine battle decision and counter/pressure tags')
    }
  }

  return {
    expertQuestions: expertQuestions.length,
    expertPracticalQuestions,
    expertOfficialTriviaQuestions,
    bannedTextMatches,
    policy: [
      '전문가 난이도에는 시즌 시작/종료 시각, UTC 일정, 반복 복습 문항을 허용하지 않습니다.',
      '전문가 난이도는 실전판단, 복합판단, 카운터 또는 압박 태그가 필요합니다.',
    ],
  }
}

function validateDifficultyHierarchy() {
  const groupedScores = Object.fromEntries(
    DIFFICULTIES.map((difficulty) => [difficulty, []]),
  )
  const placementViolations = []

  for (const question of questions) {
    const score = difficultyScore(question)
    groupedScores[question.difficulty].push(score)

    const allowedDifficulties = allowedDifficultiesFor(question)
    if (!allowedDifficulties.includes(question.difficulty)) {
      placementViolations.push({
        id: question.id,
        difficulty: question.difficulty,
        allowedDifficulties,
        generatedFrom: question.generatedFrom,
      })
      addIssue(
        question.id,
        `Difficulty placement mismatch: ${question.difficulty} is not one of ${allowedDifficulties.join(', ')}`,
      )
    }
  }

  const averageScores = Object.fromEntries(
    DIFFICULTIES.map((difficulty) => {
      const scores = groupedScores[difficulty]
      const average =
        scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1)
      return [difficulty, Number(average.toFixed(2))]
    }),
  )
  const minScores = Object.fromEntries(
    DIFFICULTIES.map((difficulty) => [
      difficulty,
      Math.min(...groupedScores[difficulty]),
    ]),
  )
  const maxScores = Object.fromEntries(
    DIFFICULTIES.map((difficulty) => [
      difficulty,
      Math.max(...groupedScores[difficulty]),
    ]),
  )

  let monotonicAverage = true
  for (let index = 1; index < DIFFICULTIES.length; index += 1) {
    const previous = DIFFICULTIES[index - 1]
    const current = DIFFICULTIES[index]
    if (averageScores[current] <= averageScores[previous]) {
      monotonicAverage = false
      addIssue(
        `difficulty-hierarchy-${current}`,
        `Average difficulty score is not increasing: ${previous}=${averageScores[previous]}, ${current}=${averageScores[current]}`,
      )
    }
  }

  return {
    averageScores,
    minScores,
    maxScores,
    monotonicAverage,
    placementViolations: placementViolations.length,
    policy: [
      '각 생성 템플릿은 허용 난이도 범위를 갖고, 범위를 벗어나면 검증 실패입니다.',
      '난이도별 평균 복잡도 점수는 입문에서 전문가까지 엄격히 증가해야 합니다.',
      '전문가 난이도는 counter-pivot 또는 speed-pressure 계열 복합 문항만 허용합니다.',
    ],
  }
}

function difficultyScore(question) {
  if (question.generatedFrom === 'pkmn-dex:type-chart-counter-pivot') {
    return 5
  }
  if (question.generatedFrom === 'pkmn-dex:speed-pressure') {
    return 5
  }
  if (question.generatedFrom === 'pkmn-dex:type-chart-resistance') {
    return 4.2
  }
  if (question.generatedFrom === 'pkmn-dex:base-speed-benchmark') {
    return 4.2
  }
  if (question.generatedFrom === 'official-regulation:mega-trap') {
    return 4
  }
  if (question.generatedFrom === 'pkmn-dex:type-chart-weakness') {
    return 3.2
  }
  if (question.generatedFrom === 'pkmn-dex:base-speed-fastest') {
    return 3.2
  }
  if (question.generatedFrom === 'pkmn-dex:ability-recognition') {
    return 3
  }
  if (question.generatedFrom === 'pkmn-dex:type-chart-stab') {
    return 2.3
  }
  if (question.generatedFrom === 'official-eligible-list:ineligible-trap') {
    return 2.3
  }
  if (question.generatedFrom === 'official-regulation:mega-allowed') {
    return 2.2
  }
  if (question.id.startsWith('timer-')) {
    return 2
  }
  if (question.generatedFrom === 'official-eligible-list:eligible-pick') {
    return 1.5
  }
  if (question.generatedFrom === 'official-eligible-list + pkmn-dex:type-identity') {
    return 1.2
  }
  if (question.generatedFrom.startsWith('official-regulation:rule-')) {
    return 1.1
  }
  return 3
}

function allowedDifficultiesFor(question) {
  if (question.generatedFrom === 'pkmn-dex:type-chart-counter-pivot') {
    return ['전문가']
  }
  if (question.generatedFrom === 'pkmn-dex:speed-pressure') {
    return ['전문가']
  }
  if (question.generatedFrom === 'pkmn-dex:type-chart-resistance') {
    return ['상급']
  }
  if (question.generatedFrom === 'pkmn-dex:base-speed-benchmark') {
    return ['상급']
  }
  if (question.generatedFrom === 'official-regulation:mega-trap') {
    return ['중급', '상급']
  }
  if (question.generatedFrom === 'pkmn-dex:type-chart-weakness') {
    return ['중급', '상급']
  }
  if (question.generatedFrom === 'pkmn-dex:base-speed-fastest') {
    return ['중급', '상급']
  }
  if (question.generatedFrom === 'pkmn-dex:ability-recognition') {
    return ['중급', '상급']
  }
  if (question.generatedFrom === 'pkmn-dex:type-chart-stab') {
    return ['초급', '중급']
  }
  if (question.generatedFrom === 'official-eligible-list:ineligible-trap') {
    return ['초급', '중급']
  }
  if (question.generatedFrom === 'official-regulation:mega-allowed') {
    return ['초급', '중급']
  }
  if (question.id === 'rule-mega-once' || question.id === 'rule-duplicate-items') {
    return ['입문']
  }
  if (question.id === 'timer-total' || question.id === 'timer-player' || question.id === 'timer-preview') {
    return ['초급']
  }
  if (question.id === 'timer-turn') {
    return ['중급']
  }
  if (question.generatedFrom === 'official-eligible-list:eligible-pick') {
    return ['입문', '초급']
  }
  if (question.generatedFrom === 'official-eligible-list + pkmn-dex:type-identity') {
    return ['입문', '초급']
  }
  return DIFFICULTIES
}

function validateSourceReferenceQuality() {
  let questionSpecificReferenceQuestions = 0
  let focusPokemonQuestions = 0
  let focusPokemonWithImages = 0

  for (const question of questions) {
    const hasSpecificReference = question.sourceRefs.some((source) =>
      /pokeapi\.co\/api\/v2\/(pokemon|type)\//.test(source.url) ||
      /dex\.pokemonshowdown\.com\/pokemon\//.test(source.url) ||
      (source.url.startsWith(REGULATION_URL) &&
        source.label !== 'Regulation Set M-A'),
    )
    if (hasSpecificReference) {
      questionSpecificReferenceQuestions += 1
    }

    if (!question.generatedFrom.startsWith('official-regulation') && !hasSpecificReference) {
      addIssue(question.id, 'Non-regulation question needs a Pokemon or type specific reference URL')
    }

    if (question.focusPokemon) {
      focusPokemonQuestions += 1
      if (question.focusPokemon.imageUrl) {
        focusPokemonWithImages += 1
      } else {
        addIssue(question.id, 'Pokemon-specific question is missing an image URL')
      }
    }
  }

  return {
    questionSpecificReferenceQuestions,
    focusPokemonQuestions,
    focusPokemonWithImages,
    policy: [
      '비규정 문항은 PokeAPI Pokemon/Type 또는 Pokemon Showdown Dex의 문제별 URL을 포함해야 합니다.',
      '지문에 특정 포켓몬이 등장하는 문항은 focusPokemon 메타데이터와 이미지 URL을 포함해야 합니다.',
    ],
  }
}

async function validatePokeApiTypeCrossCheck() {
  const results = await mapConcurrent(eligiblePokemon, 12, async (pokemon) => {
    const pokeApiName = normalizePokeApiName(pokemon.en)
    const response = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${pokeApiName}`)
    if (!response.ok) {
      return {
        code: pokemon.code,
        name: pokemon.en,
        pokeApiName,
        status: 'skipped',
        reason: `PokeAPI ${response.status}`,
      }
    }
    const payload = await response.json()
    const pokeApiTypes = payload.types.map((slot) => titleCase(slot.type.name))
    const matches = sameMembers(pokeApiTypes, pokemon.types)
    if (!matches) {
      addIssue(
        `pokeapi-type-${pokemon.code}`,
        `Type mismatch for ${pokemon.en}: @pkmn/dex=${pokemon.types.join('/')} PokeAPI=${pokeApiTypes.join('/')}`,
      )
    }
    return {
      code: pokemon.code,
      name: pokemon.en,
      pokeApiName,
      status: matches ? 'verified' : 'mismatch',
      pkmnDexTypes: pokemon.types,
      pokeApiTypes,
    }
  })

  return {
    verified: results.filter((result) => result.status === 'verified').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
    mismatches: results.filter((result) => result.status === 'mismatch'),
    skippedEntries: results.filter((result) => result.status === 'skipped'),
  }
}

function renderReport(summary, validationIssues) {
  const lines = [
    '# Quiz Validation Report',
    '',
    `Generated: ${summary.generatedAt}`,
    `Status: ${summary.status}`,
    '',
    '## Sources',
    '',
    `- Official Regulation Set M-A: ${REGULATION_URL}`,
    `- Official eligible Pokemon list: ${ELIGIBLE_KO_URL}`,
    '- PokeAPI cross-check: https://pokeapi.co/',
    '- @pkmn/dex data package: https://github.com/pkmn/ps',
    '- Pokemon.com Pokedex for manual spot checks: https://www.pokemon.com/us/pokedex',
    '',
    '## Results',
    '',
    `- Total questions checked: ${summary.totalQuestions}`,
    `- Official eligible Pokemon checked: ${summary.officialEligiblePokemon}`,
    `- Official allowed Mega Evolutions checked: ${summary.officialAllowedMegaEvolutions}`,
    `- PokeAPI type cross-check: ${summary.pokeApiTypeCrossCheck.verified}/${summary.officialEligiblePokemon} verified`,
    `- Expert practical questions: ${summary.pedagogyQuality.expertPracticalQuestions}/${summary.pedagogyQuality.expertQuestions}`,
    `- Expert official trivia questions: ${summary.pedagogyQuality.expertOfficialTriviaQuestions}`,
    `- Non-practical banned text matches: ${summary.pedagogyQuality.bannedTextMatches}`,
    `- Question-specific reference coverage: ${summary.sourceReferenceQuality.questionSpecificReferenceQuestions}/${summary.totalQuestions}`,
    `- Focus Pokemon images: ${summary.sourceReferenceQuality.focusPokemonWithImages}/${summary.sourceReferenceQuality.focusPokemonQuestions}`,
    `- Difficulty hierarchy monotonic: ${summary.difficultyHierarchy.monotonicAverage}`,
    `- Difficulty placement violations: ${summary.difficultyHierarchy.placementViolations}`,
    `- Issues: ${validationIssues.length}`,
    '',
    '## Difficulty Counts',
    '',
    ...Object.entries(summary.byDifficulty).map(([difficulty, count]) => `- ${difficulty}: ${count}`),
    '',
    '## Difficulty Hierarchy',
    '',
    ...Object.entries(summary.difficultyHierarchy.averageScores).map(
      ([difficulty, score]) => `- ${difficulty}: average ${score}, min ${summary.difficultyHierarchy.minScores[difficulty]}, max ${summary.difficultyHierarchy.maxScores[difficulty]}`,
    ),
    '',
    '## Caveats',
    '',
    ...summary.caveats.map((caveat) => `- ${caveat}`),
  ]

  if (validationIssues.length > 0) {
    lines.push('', '## Issues', '')
    for (const issue of validationIssues) {
      lines.push(`- ${issue.id}: ${issue.message}`)
    }
  }

  return `${lines.join('\n')}\n`
}

async function fetchEligible(url) {
  const html = await fetchText(url)
  const match = html.match(/const pokemons = (\[.*?\]);/s)
  if (!match) {
    throw new Error(`Unable to parse eligible Pokemon list from ${url}`)
  }
  return JSON.parse(match[1]).map(([code, marker, name]) => ({
    code,
    marker,
    name,
  }))
}

async function fetchText(url) {
  const response = await fetchWithRetry(url)
  return response.text()
}

async function fetchWithRetry(url, retries = 2) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'pokemon-champions-quiz-validator/1.0' },
      })
      if (!response.ok) {
        throw new Error(`Fetch failed ${response.status}: ${url}`)
      }
      return response
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await delay(250 * (attempt + 1))
      }
    }
  }
  throw lastError
}

function parseAllowedMegas(html) {
  const match = html.match(/<h4>(.*?)<\/h4>/s)
  if (!match) {
    throw new Error('Unable to parse Mega Evolution list')
  }
  return match[1]
    .split(/<br\s*\/?>/i)
    .map((line) =>
      line
        .replace(/<[^>]+>/g, '')
        .replace(/[\u200b\u200c\ufeff]/g, '')
        .trim(),
    )
    .filter(Boolean)
}

function normalizeDexName(name) {
  if (EXACT_DEX_NAMES.has(name)) {
    return EXACT_DEX_NAMES.get(name)
  }
  const formMatch = name.match(/^(.*?) \((Alolan|Galarian|Hisuian) Form\)$/)
  if (formMatch) {
    const suffix = {
      Alolan: 'Alola',
      Galarian: 'Galar',
      Hisuian: 'Hisui',
    }[formMatch[2]]
    return `${formMatch[1]}-${suffix}`
  }
  return name
}

function normalizePokeApiName(name) {
  if (EXACT_POKEAPI_NAMES.has(name)) {
    return EXACT_POKEAPI_NAMES.get(name)
  }
  const formMatch = name.match(/^(.*?) \((Alolan|Galarian|Hisuian) Form\)$/)
  if (formMatch) {
    const suffix = {
      Alolan: 'alola',
      Galarian: 'galar',
      Hisuian: 'hisui',
    }[formMatch[2]]
    return `${toSlug(formMatch[1])}-${suffix}`
  }
  return toSlug(name)
}

function pokemonByCodeFromId(id, prefix) {
  const code = id.slice(prefix.length).slice(0, 8)
  const pokemon = codeToPokemon.get(code)
  if (!pokemon) {
    addIssue(id, `Unknown official eligible code ${code}`)
    return eligiblePokemon[0]
  }
  return pokemon
}

function parseCodeAndType(id, prefix) {
  const rest = id.slice(prefix.length)
  const code = rest.slice(0, 8)
  const typeSlug = rest.slice(9)
  return {
    code,
    typeName: typeFromSlug(typeSlug),
  }
}

function officialRuleAnswer(id) {
  for (const [prefix, answer] of OFFICIAL_RULE_ANSWERS) {
    if (id.startsWith(prefix)) {
      return answer
    }
  }
  return null
}

function requirePokemon(code, question) {
  const pokemon = codeToPokemon.get(code)
  expect(Boolean(pokemon), question, `Unknown official eligible code ${code}`)
  return pokemon ?? eligiblePokemon[0]
}

function expectAnswer(question, expected) {
  const actual = question.choices[question.answerIndex]
  expect(actual === expected, question, `Expected answer "${expected}", got "${actual}"`)
}

function expect(condition, question, message) {
  if (!condition) {
    addIssue(question.id, message)
  }
}

function addIssue(id, message) {
  issues.push({ id, message })
}

function damageMultiplier(attackType, defenderTypes) {
  return defenderTypes.reduce(
    (multiplier, defenderType) =>
      multiplier * (ATTACK_CHART[attackType]?.[defenderType] ?? 1),
    1,
  )
}

function hasStabSuperEffective(attacker, defender) {
  return attacker.types.some(
    (typeName) => damageMultiplier(typeName, defender.types) > 1,
  )
}

function labelPokemon(pokemon) {
  if (pokemon.ko && pokemon.ko !== pokemon.en) {
    return `${pokemon.ko} (${pokemon.en})`
  }
  return pokemon.en
}

function typeLabel(typeName) {
  return `${TYPE_LABELS[typeName] ?? typeName} (${typeName})`
}

function typeComboLabel(types) {
  return types.map(typeLabel).join(' / ')
}

function typeFromSlug(slug) {
  const match = Object.keys(TYPE_LABELS).find((typeName) => toSlug(typeName) === slug)
  if (!match) {
    throw new Error(`Unknown type slug ${slug}`)
  }
  return match
}

function sameMembers(left, right) {
  return left.length === right.length && left.every((value) => right.includes(value))
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function isHttpUrl(value) {
  return /^https?:\/\//.test(value)
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function mapConcurrent(items, limit, callback) {
  const results = []
  let index = 0
  async function worker() {
    while (index < items.length) {
      const current = index
      index += 1
      results[current] = await callback(items[current], current)
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}
