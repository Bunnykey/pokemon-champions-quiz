import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { Dex } from '@pkmn/dex'

const RETRIEVED_AT = '2026-05-04'
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
  ['event-start', '2026-04-08 02:00 UTC'],
  ['event-end', '2026-06-17 01:59 UTC'],
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
        question.sourceRefs.some((source) => source.url === REGULATION_URL),
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
    }
  }
}

async function validatePokeApiTypeCrossCheck() {
  const results = await mapConcurrent(eligiblePokemon, 12, async (pokemon) => {
    const pokeApiName = normalizePokeApiName(pokemon.en)
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeApiName}`)
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
    `- Issues: ${validationIssues.length}`,
    '',
    '## Difficulty Counts',
    '',
    ...Object.entries(summary.byDifficulty).map(([difficulty, count]) => `- ${difficulty}: ${count}`),
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
  const response = await fetch(url, {
    headers: { 'user-agent': 'pokemon-champions-quiz-validator/1.0' },
  })
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`)
  }
  return response.text()
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
