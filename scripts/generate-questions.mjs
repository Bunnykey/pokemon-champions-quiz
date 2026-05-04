import { writeFile } from 'node:fs/promises'
import { Dex } from '@pkmn/dex'

const RETRIEVED_AT = '2026-05-04'
const REGULATION_URL =
  'https://champions-news.pokemon-home.com/en/page/751.html'
const ELIGIBLE_EN_URL =
  'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/en/pokemon.html'
const ELIGIBLE_KO_URL =
  'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/ko/pokemon.html'

const SOURCE_REGULATION = {
  kind: 'official-regulation',
  label: 'Regulation Set M-A',
  url: REGULATION_URL,
  retrievedAt: RETRIEVED_AT,
}

const SOURCE_ELIGIBLE = {
  kind: 'official-eligible-list',
  label: 'Regulation Set M-A Eligible Pokémon',
  url: ELIGIBLE_KO_URL,
  retrievedAt: RETRIEVED_AT,
}

const SOURCE_DEX = {
  kind: 'pkmn-dex',
  label: '@pkmn/dex species, type, stat, ability data',
  url: 'https://github.com/pkmn/ps',
  retrievedAt: RETRIEVED_AT,
}

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

const FAKE_MEGA_NAMES = [
  'Mega Mewtwo X',
  'Mega Salamence',
  'Mega Metagross',
  'Mega Mawile',
  'Mega Sceptile',
  'Mega Swampert',
  'Mega Blaziken',
  'Mega Latias',
  'Mega Latios',
  'Mega Diancie',
  'Mega Rayquaza',
  'Mega Mawile',
  'Mega Haxorus',
  'Mega Volcarona',
  'Mega Sylveon',
  'Mega Dragapult',
]

async function main() {
  const [eligibleEn, eligibleKo, allowedMegas] = await Promise.all([
    fetchEligible(ELIGIBLE_EN_URL),
    fetchEligible(ELIGIBLE_KO_URL),
    fetchAllowedMegas(),
  ])

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
      baseStats: species.baseStats ?? {},
      abilities: Object.values(species.abilities ?? {}),
      speed: species.baseStats?.spe ?? 0,
      bst: species.bst ?? 0,
    }
  })

  const missing = eligiblePokemon.filter((pokemon) => !pokemon.species.exists)
  if (missing.length > 0) {
    throw new Error(
      `Missing @pkmn/dex species: ${missing
        .map((pokemon) => `${pokemon.en} -> ${pokemon.dexName}`)
        .join(', ')}`,
    )
  }

  const usable = eligiblePokemon.filter(
    (pokemon) => pokemon.types.length > 0 && pokemon.speed > 0,
  )
  const ineligiblePokemon = Dex.species
    .all()
    .filter((species) => {
      if (!species.exists || species.nfe || species.isMega || species.isPrimal) {
        return false
      }
      if (species.isNonstandard || species.name.includes('-Gmax')) {
        return false
      }
      if (!species.baseStats?.spe || !species.types?.length) {
        return false
      }
      return !new Set(usable.map((pokemon) => pokemon.species.name)).has(species.name)
    })
    .map((species) => ({
      en: species.name,
      ko: species.name,
      species,
      types: species.types,
      baseStats: species.baseStats,
      speed: species.baseStats.spe,
      bst: species.bst,
    }))

  const questions = []
  const ids = new Set()
  const add = (question) => {
    if (!question || ids.has(question.id)) {
      return
    }
    validateQuestion(question)
    ids.add(question.id)
    questions.push(question)
  }

  buildTypeIdentityQuestions(usable).forEach(add)
  buildEligiblePickQuestions(usable, ineligiblePokemon).forEach(add)
  buildIneligibleTrapQuestions(usable, ineligiblePokemon).forEach(add)
  buildMegaQuestions(allowedMegas).forEach(add)
  buildRuleQuestions().forEach(add)
  buildTypeWeaknessQuestions(usable).forEach(add)
  buildStabQuestions(usable).forEach(add)
  buildResistanceQuestions(usable).forEach(add)
  buildSpeedQuestions(usable).forEach(add)
  buildAbilityQuestions(usable).forEach(add)

  if (questions.length < 1000) {
    throw new Error(`Generated ${questions.length} questions, expected at least 1000`)
  }

  const sorted = DIFFICULTIES.flatMap((difficulty) =>
    questions.filter((question) => question.difficulty === difficulty),
  )

  await writeFile(
    new URL('../src/data/questions.json', import.meta.url),
    `${JSON.stringify(sorted, null, 2)}\n`,
  )

  console.log(`Generated ${sorted.length} questions`)
  console.log(
    Object.fromEntries(
      DIFFICULTIES.map((difficulty) => [
        difficulty,
        sorted.filter((question) => question.difficulty === difficulty).length,
      ]),
    ),
  )
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

async function fetchAllowedMegas() {
  const html = await fetchText(REGULATION_URL)
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'pokemon-champions-quiz-generator/1.0' },
  })
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`)
  }
  return response.text()
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

function buildTypeIdentityQuestions(usable) {
  return usable.map((pokemon, index) =>
    makeQuestion({
      id: `type-id-${pokemon.code}`,
      difficulty: index % 3 === 0 ? '초급' : '입문',
      tags: ['타입', '도감', '기초'],
      promptKo: `${labelPokemon(pokemon)}의 타입 조합은?`,
      answer: typeComboLabel(pokemon.types),
      distractors: nearbyTypeCombos(usable, pokemon.types, pokemon.dexName),
      explanationKo: `${labelPokemon(pokemon)}은 ${typeComboLabel(
        pokemon.types,
      )} 타입입니다. 타입 확인은 상성 판단과 STAB 판단의 출발점입니다.`,
      sourceRefs: [SOURCE_ELIGIBLE, SOURCE_DEX],
      generatedFrom: 'official-eligible-list + pkmn-dex:type-identity',
    }),
  )
}

function buildEligiblePickQuestions(usable, ineligible) {
  return usable.slice(0, 180).map((pokemon, index) =>
    makeQuestion({
      id: `eligible-pick-${pokemon.code}`,
      difficulty: index % 2 === 0 ? '입문' : '초급',
      tags: ['규정', '참가가능', '선출'],
      promptKo: '다음 중 Regulation Set M-A에서 참가할 수 있는 포켓몬은?',
      answer: labelPokemon(pokemon),
      distractors: sample(
        ineligible,
        3,
        seededRandom(`eligible-pick-${pokemon.code}`),
      ).map(labelPokemon),
      explanationKo: `${labelPokemon(
        pokemon,
      )}은 공식 참가 가능 포켓몬 목록에 포함되어 있습니다. M-A에서는 목록에 표시된 포켓몬만 랭크배틀에 사용할 수 있습니다.`,
      sourceRefs: [SOURCE_ELIGIBLE],
      generatedFrom: 'official-eligible-list:eligible-pick',
    }),
  )
}

function buildIneligibleTrapQuestions(usable, ineligible) {
  return ineligible.slice(0, 160).map((pokemon, index) =>
    makeQuestion({
      id: `ineligible-trap-${toId(pokemon.en)}-${index}`,
      difficulty: index % 3 === 0 ? '중급' : '초급',
      tags: ['규정', '참가불가', '함정'],
      promptKo: '다음 중 Regulation Set M-A의 참가 가능 목록에 없는 포켓몬은?',
      answer: labelPokemon(pokemon),
      distractors: sample(
        usable,
        3,
        seededRandom(`ineligible-trap-${pokemon.en}-${index}`),
      ).map(labelPokemon),
      explanationKo: `${labelPokemon(
        pokemon,
      )}은 현재 M-A 공식 참가 가능 목록에 없습니다. 규정 문제는 강한 포켓몬인지보다 현 시즌 목록 포함 여부가 기준입니다.`,
      sourceRefs: [SOURCE_ELIGIBLE],
      generatedFrom: 'official-eligible-list:ineligible-trap',
    }),
  )
}

function buildMegaQuestions(allowedMegas) {
  const allowedQuestions = allowedMegas.map((megaName, index) =>
    makeQuestion({
      id: `mega-allowed-${toId(megaName)}`,
      difficulty: index % 4 === 0 ? '중급' : '초급',
      tags: ['규정', '메가진화', '랭크배틀'],
      promptKo: '다음 중 Regulation Set M-A에서 허용되는 메가진화는?',
      answer: megaName,
      distractors: sample(
        FAKE_MEGA_NAMES,
        3,
        seededRandom(`mega-allowed-${megaName}`),
      ),
      explanationKo: `${megaName}는 M-A 공식 공지의 허용 메가진화 목록에 포함되어 있습니다. 메가진화는 배틀당 1회만 사용할 수 있습니다.`,
      sourceRefs: [SOURCE_REGULATION],
      generatedFrom: 'official-regulation:mega-allowed',
    }),
  )

  const trapQuestions = FAKE_MEGA_NAMES.concat(FAKE_MEGA_NAMES).map(
    (megaName, index) =>
      makeQuestion({
        id: `mega-trap-${toId(megaName)}-${index}`,
        difficulty: index % 3 === 0 ? '상급' : '중급',
        tags: ['규정', '메가진화', '함정'],
        promptKo: '다음 중 Regulation Set M-A 허용 메가진화 목록에 없는 것은?',
        answer: megaName,
        distractors: sample(
          allowedMegas,
          3,
          seededRandom(`mega-trap-${megaName}-${index}`),
        ),
        explanationKo: `${megaName}는 M-A 허용 메가진화 목록에 없습니다. 비슷하게 강한 메가진화라도 현재 규정 목록에 없으면 사용할 수 없습니다.`,
        sourceRefs: [SOURCE_REGULATION],
        generatedFrom: 'official-regulation:mega-trap',
      }),
  )

  return [...allowedQuestions, ...trapQuestions]
}

function buildRuleQuestions() {
  const templates = [
    {
      id: 'rule-mega-once',
      difficulty: '입문',
      tags: ['규정', '메가진화'],
      promptKo: 'Regulation Set M-A에서 메가진화 사용 횟수는?',
      answer: '배틀당 1회',
      distractors: ['턴마다 1회', '포켓몬마다 1회', '사용할 수 없음'],
      explanationKo:
        '공식 M-A 규정은 메가진화를 배틀당 1회만 사용할 수 있다고 명시합니다.',
    },
    {
      id: 'rule-duplicate-items',
      difficulty: '입문',
      tags: ['규정', '도구'],
      promptKo: 'Regulation Set M-A의 지닌 도구 규칙으로 맞는 것은?',
      answer: '중복 지닌 도구는 허용되지 않는다',
      distractors: [
        '같은 메가스톤만 중복 금지다',
        '모든 도구 중복이 허용된다',
        '도구는 사용할 수 없다',
      ],
      explanationKo:
        '공식 M-A 공지는 Duplicate held items are not allowed라고 안내합니다.',
    },
    {
      id: 'timer-total',
      difficulty: '초급',
      tags: ['규정', '타이머'],
      promptKo: 'Regulation Set M-A의 총 배틀 시간은?',
      answer: '20분',
      distractors: ['10분', '15분', '30분'],
      explanationKo: 'M-A 타이머는 Total Time 20 minutes입니다.',
    },
    {
      id: 'timer-player',
      difficulty: '중급',
      tags: ['규정', '타이머'],
      promptKo: 'Regulation Set M-A의 플레이어 시간은?',
      answer: '7분',
      distractors: ['5분', '10분', '15분'],
      explanationKo: 'M-A 타이머는 Player Time 7 minutes입니다.',
    },
    {
      id: 'timer-turn',
      difficulty: '상급',
      tags: ['규정', '타이머'],
      promptKo: 'Regulation Set M-A의 턴 선택 시간은?',
      answer: '45초',
      distractors: ['30초', '60초', '90초'],
      explanationKo: 'M-A 타이머는 Turn Time 45 seconds입니다.',
    },
    {
      id: 'timer-preview',
      difficulty: '전문가',
      tags: ['규정', '타이머', '선출'],
      promptKo: 'Regulation Set M-A의 선출 시간은?',
      answer: '90초',
      distractors: ['45초', '60초', '120초'],
      explanationKo: 'M-A 타이머는 Preview Time 90 seconds입니다.',
    },
    {
      id: 'event-start',
      difficulty: '초급',
      tags: ['규정', '시즌'],
      promptKo: 'Regulation Set M-A 시작 시각은?',
      answer: '2026-04-08 02:00 UTC',
      distractors: [
        '2026-04-08 00:00 UTC',
        '2026-05-04 02:00 UTC',
        '2026-06-17 01:59 UTC',
      ],
      explanationKo:
        'M-A 공식 일정은 2026-04-08 02:00 UTC부터 2026-06-17 01:59 UTC까지입니다.',
    },
    {
      id: 'event-end',
      difficulty: '전문가',
      tags: ['규정', '시즌'],
      promptKo: 'Regulation Set M-A 종료 시각은?',
      answer: '2026-06-17 01:59 UTC',
      distractors: [
        '2026-06-17 02:00 UTC',
        '2026-04-08 01:59 UTC',
        '2026-05-17 01:59 UTC',
      ],
      explanationKo:
        'M-A 공식 일정은 2026-06-17 01:59 UTC에 종료됩니다.',
    },
  ]

  return templates.flatMap((template, templateIndex) =>
    Array.from({ length: 6 }, (_, repeat) =>
      makeQuestion({
        id: `${template.id}-${repeat + 1}`,
        difficulty: template.difficulty,
        tags: template.tags,
        promptKo:
          repeat === 0
            ? template.promptKo
            : `${template.promptKo} (${repeat + 1}회차 복습)`,
        answer: template.answer,
        distractors: rotate(template.distractors, repeat),
        explanationKo: template.explanationKo,
        sourceRefs: [SOURCE_REGULATION],
        generatedFrom: `official-regulation:rule-${templateIndex}`,
      }),
    ),
  )
}

function buildTypeWeaknessQuestions(usable) {
  return usable.flatMap((pokemon, index) => {
    const weaknesses = ALL_TYPES.filter(
      (typeName) => damageMultiplier(typeName, pokemon.types) > 1,
    )
    if (weaknesses.length === 0) {
      return []
    }
    const answer = weaknesses[index % weaknesses.length]
    const wrongTypes = ALL_TYPES.filter(
      (typeName) => damageMultiplier(typeName, pokemon.types) <= 1,
    )
    return [
      makeQuestion({
        id: `weakness-${pokemon.code}-${toId(answer)}`,
        difficulty: index % 4 === 0 ? '상급' : '중급',
        tags: ['상성', '기술타입', '실전판단'],
        promptKo: `${labelPokemon(
          pokemon,
        )}에게 효과가 굉장한 기술 타입은?`,
        answer: typeLabel(answer),
        distractors: sample(
          wrongTypes.map(typeLabel),
          3,
          seededRandom(`weakness-${pokemon.code}-${answer}`),
        ),
        explanationKo: `${labelPokemon(pokemon)}의 타입은 ${typeComboLabel(
          pokemon.types,
        )}입니다. ${typeLabel(answer)} 기술은 이 조합에 ${formatMultiplier(
          damageMultiplier(answer, pokemon.types),
        )}로 들어갑니다.`,
        sourceRefs: [SOURCE_ELIGIBLE, SOURCE_DEX],
        generatedFrom: 'pkmn-dex:type-chart-weakness',
      }),
    ]
  })
}

function buildStabQuestions(usable) {
  return usable.slice(0, 180).map((pokemon, index) => {
    const answerType = pokemon.types[index % pokemon.types.length]
    const wrongTypes = ALL_TYPES.filter((typeName) => !pokemon.types.includes(typeName))
    return makeQuestion({
      id: `stab-${pokemon.code}-${toId(answerType)}`,
      difficulty: index % 3 === 0 ? '중급' : '초급',
      tags: ['STAB', '기술타입', '타입'],
      promptKo: `${labelPokemon(
        pokemon,
      )}가 자속 보정(STAB)을 받을 수 있는 기술 타입은?`,
      answer: typeLabel(answerType),
      distractors: sample(
        wrongTypes.map(typeLabel),
        3,
        seededRandom(`stab-${pokemon.code}-${answerType}`),
      ),
      explanationKo: `${labelPokemon(pokemon)}는 ${typeComboLabel(
        pokemon.types,
      )} 타입이므로 ${typeLabel(
        answerType,
      )} 기술을 사용할 때 자속 보정을 받을 수 있습니다.`,
      sourceRefs: [SOURCE_ELIGIBLE, SOURCE_DEX],
      generatedFrom: 'pkmn-dex:type-chart-stab',
    })
  })
}

function buildResistanceQuestions(usable) {
  return ALL_TYPES.flatMap((attackType, typeIndex) =>
    Array.from({ length: 10 }, (_, repeat) => {
      const rng = seededRandom(`resist-${attackType}-${repeat}`)
      const resistant = sample(
        usable.filter((pokemon) => damageMultiplier(attackType, pokemon.types) < 1),
        1,
        rng,
      )[0]
      const unsafe = sample(
        usable.filter((pokemon) => damageMultiplier(attackType, pokemon.types) >= 1),
        3,
        rng,
      )
      if (!resistant || unsafe.length < 3) {
        return null
      }
      return makeQuestion({
        id: `resist-${toId(attackType)}-${repeat}`,
        difficulty: typeIndex % 3 === 0 ? '전문가' : '상급',
        tags: ['상성', '교체', '실전판단'],
        promptKo: `${typeLabel(
          attackType,
        )} 기술을 예상할 때, 가장 안전한 교체 후보는?`,
        answer: labelPokemon(resistant),
        distractors: unsafe.map(labelPokemon),
        explanationKo: `${labelPokemon(resistant)}는 ${typeComboLabel(
          resistant.types,
        )} 타입이라 ${typeLabel(attackType)} 기술을 ${formatMultiplier(
          damageMultiplier(attackType, resistant.types),
        )}로 받습니다. 나머지 후보보다 교체 리스크가 낮습니다.`,
        sourceRefs: [SOURCE_ELIGIBLE, SOURCE_DEX],
        generatedFrom: 'pkmn-dex:type-chart-resistance',
      })
    }),
  )
}

function buildSpeedQuestions(usable) {
  const sortedBySpeed = [...usable].sort((a, b) => b.speed - a.speed)
  const fastestQuestions = Array.from({ length: 190 }, (_, index) => {
    const rng = seededRandom(`speed-fastest-${index}`)
    const picks = uniqueBy(
      sample(sortedBySpeed, 4, rng),
      (pokemon) => pokemon.speed,
    )
    if (picks.length < 4) {
      return null
    }
    const answer = [...picks].sort((a, b) => b.speed - a.speed)[0]
    const spread = Math.max(...picks.map((pokemon) => pokemon.speed)) -
      Math.min(...picks.map((pokemon) => pokemon.speed))
    return makeQuestion({
      id: `speed-fastest-${index}`,
      difficulty: spread <= 15 ? '전문가' : index % 2 === 0 ? '상급' : '중급',
      tags: ['스피드', '선공', '실전판단'],
      promptKo: '동일 조건에서 가장 먼저 행동하는 포켓몬은?',
      answer: labelPokemon(answer),
      distractors: picks
        .filter((pokemon) => pokemon !== answer)
        .map(labelPokemon),
      explanationKo: `${labelPokemon(answer)}의 기본 스피드는 ${
        answer.speed
      }입니다. 후보 중 가장 높은 기본 스피드를 가지므로 동일 조건에서 먼저 행동합니다.`,
      sourceRefs: [SOURCE_ELIGIBLE, SOURCE_DEX],
      generatedFrom: 'pkmn-dex:base-speed-fastest',
    })
  })

  const benchmarkQuestions = usable.slice(0, 160).map((pokemon, index) => {
    const faster = usable.filter(
      (candidate) => candidate.speed > pokemon.speed && candidate.dexName !== pokemon.dexName,
    )
    const slower = usable.filter(
      (candidate) => candidate.speed <= pokemon.speed && candidate.dexName !== pokemon.dexName,
    )
    if (faster.length < 1 || slower.length < 3) {
      return null
    }
    const rng = seededRandom(`speed-benchmark-${pokemon.code}`)
    const answer = sample(faster, 1, rng)[0]
    return makeQuestion({
      id: `speed-benchmark-${pokemon.code}`,
      difficulty: index % 2 === 0 ? '상급' : '전문가',
      tags: ['스피드', '스피드티어', '실전판단'],
      promptKo: `${labelPokemon(
        pokemon,
      )}보다 기본 스피드가 높은 포켓몬은?`,
      answer: labelPokemon(answer),
      distractors: sample(slower, 3, rng).map(labelPokemon),
      explanationKo: `${labelPokemon(pokemon)}의 기본 스피드는 ${
        pokemon.speed
      }이고, ${labelPokemon(answer)}의 기본 스피드는 ${
        answer.speed
      }입니다.`,
      sourceRefs: [SOURCE_ELIGIBLE, SOURCE_DEX],
      generatedFrom: 'pkmn-dex:base-speed-benchmark',
    })
  })

  return [...fastestQuestions, ...benchmarkQuestions]
}

function buildAbilityQuestions(usable) {
  const abilityPool = Array.from(
    new Set(usable.flatMap((pokemon) => pokemon.abilities).filter(Boolean)),
  )

  return usable
    .filter((pokemon) => pokemon.abilities.length > 0)
    .slice(0, 130)
    .map((pokemon, index) => {
      const rng = seededRandom(`ability-${pokemon.code}`)
      const answer = pokemon.abilities[index % pokemon.abilities.length]
      return makeQuestion({
        id: `ability-${pokemon.code}`,
        difficulty: index % 4 === 0 ? '전문가' : '상급',
        tags: ['특성', '도감', '실전준비'],
        promptKo: `${labelPokemon(pokemon)}가 가질 수 있는 특성은?`,
        answer,
        distractors: sample(
          abilityPool.filter((ability) => !pokemon.abilities.includes(ability)),
          3,
          rng,
        ),
        explanationKo: `${labelPokemon(pokemon)}의 @pkmn/dex 기준 특성 후보에는 ${pokemon.abilities.join(
          ', ',
        )}가 포함됩니다. 특성은 선출 전 역할 추정에 직접 영향을 줍니다.`,
        sourceRefs: [SOURCE_ELIGIBLE, SOURCE_DEX],
        generatedFrom: 'pkmn-dex:ability-recognition',
      })
    })
}

function makeQuestion({
  id,
  difficulty,
  tags,
  promptKo,
  answer,
  distractors,
  explanationKo,
  sourceRefs,
  generatedFrom,
}) {
  const choices = unique([answer, ...distractors])
  if (choices.length < 4) {
    return null
  }
  const shuffled = shuffle(choices.slice(0, 4), seededRandom(id))
  return {
    id,
    difficulty,
    tags,
    promptKo,
    choices: shuffled,
    answerIndex: shuffled.indexOf(answer),
    explanationKo,
    sourceRefs,
    generatedFrom,
  }
}

function validateQuestion(question) {
  if (!DIFFICULTIES.includes(question.difficulty)) {
    throw new Error(`Invalid difficulty ${question.id}`)
  }
  if (question.choices.length !== 4 || question.answerIndex < 0) {
    throw new Error(`Invalid choices ${question.id}`)
  }
  if (!question.sourceRefs.length) {
    throw new Error(`Missing sourceRefs ${question.id}`)
  }
}

function nearbyTypeCombos(usable, types, selfDexName) {
  return unique(
    sample(
      usable.filter((pokemon) => pokemon.dexName !== selfDexName),
      16,
      seededRandom(`type-combos-${selfDexName}`),
    ).map((pokemon) => typeComboLabel(pokemon.types)),
  ).filter((combo) => combo !== typeComboLabel(types))
}

function damageMultiplier(attackType, defenderTypes) {
  return defenderTypes.reduce(
    (multiplier, defenderType) =>
      multiplier * (ATTACK_CHART[attackType]?.[defenderType] ?? 1),
    1,
  )
}

const ALL_TYPES = Object.keys(TYPE_LABELS)

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

function formatMultiplier(multiplier) {
  if (multiplier === 0) {
    return '0배'
  }
  if (multiplier === 0.25) {
    return '1/4배'
  }
  if (multiplier === 0.5) {
    return '1/2배'
  }
  return `${multiplier}배`
}

function sample(items, count, rng) {
  return shuffle([...items], rng).slice(0, count)
}

function rotate(items, count) {
  const offset = count % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

function shuffle(items, rng) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    ;[items[index], items[swapIndex]] = [items[swapIndex], items[index]]
  }
  return items
}

function unique(items) {
  return Array.from(new Set(items))
}

function uniqueBy(items, getKey) {
  const seen = new Set()
  return items.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function seededRandom(seed) {
  let value = hash(seed)
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let next = Math.imul(value ^ (value >>> 15), 1 | value)
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

function hash(value) {
  let output = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index)
    output = Math.imul(output, 16777619)
  }
  return output >>> 0
}

function toId(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
