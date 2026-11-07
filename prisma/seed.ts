import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Demo video sources (Creative Commons / public test videos) - replace with your own licensed content
const VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
]

interface SeedDrama {
  title: string
  description: string
  genre: string
  tags: string[]
  totalEpisodes: number
  status: 'ongoing' | 'completed'
  views: number
  likes: number
  featured?: boolean
  trending?: boolean
  mustSee?: boolean
  hiddenGem?: boolean
  isNew?: boolean
  freeEpisodes?: number
}

const DRAMAS: SeedDrama[] = [
  {
    title: 'The CEO\u2019s Contract Bride',
    description:
      'To save her family\u2019s collapsing company, calla lily shop owner Mia signs a one-year marriage contract with cold-hearted CEO Alexander Chen. The rule is simple: no feelings involved. But when midnight work sessions turn into shared laughter and he remembers exactly how she takes her coffee, the contract starts to feel dangerously real. On the day the papers expire, Alexander tears them up \u2014 but Mia has already discovered the secret clause he never told her about.',
    genre: 'Romance',
    tags: ['CEO', 'Contract Marriage', 'Sweet Love', 'Urban'],
    totalEpisodes: 68,
    status: 'completed',
    views: 8452300,
    likes: 412300,
    featured: true,
    mustSee: true,
    trending: true,
    freeEpisodes: 12,
  },
  {
    title: 'Fated to the Alpha King',
    description:
      'Born a pack orphan, Luna has spent her life hiding the silver scar that marks her as cursed. When the Alpha King arrives to choose a bride, her scent betrays her \u2014 she is his fated mate, the one the prophecies said would destroy the throne. Enemies inside the palace want her dead before the moon ceremony, and the Alpha King must decide: protect his kingdom, or the girl the moon goddess sent to burn it down.',
    genre: 'Fantasy',
    tags: ['Werewolf', 'Alpha', 'Fated Mates', 'Royalty'],
    totalEpisodes: 82,
    status: 'ongoing',
    views: 12680000,
    likes: 587400,
    featured: true,
    mustSee: true,
    trending: true,
    freeEpisodes: 10,
  },
  {
    title: 'Revenge of the Hidden Heiress',
    description:
      'For eighteen years Nora scrubbed floors in the mansion of the family that stole her name. On the night they celebrate her cousin\u2019s engagement to her ex-fianc\u00e9, a fleet of black cars arrives \u2014 the world\u2019s richest conglomerate has found their long-lost heiress. Now Nora is back at the top of the food chain, and everyone who mocked her is about to learn one lesson: never mistake kindness for weakness.',
    genre: 'Revenge',
    tags: ['Heiress', 'Face-Slapping', 'Strong Female Lead', 'Rich Family'],
    totalEpisodes: 75,
    status: 'completed',
    views: 10230000,
    likes: 498200,
    featured: true,
    mustSee: true,
    freeEpisodes: 12,
  },
  {
    title: 'Second Chance: Divorce the Tycoon',
    description:
      'Poisoned on her deathbed, Elena wakes up three years in the past \u2014 on the morning she married the man who would betray her. This time she refuses the wedding, dumps the tycoon, and takes her grandmother\u2019s secret design portfolio straight to his biggest rival. As her star rises, her ex-husband starts to realize the woman he discarded is the empire\u2019s new queen. Too bad she\u2019s already falling for someone else.',
    genre: 'Revenge',
    tags: ['Time Travel', 'Second Chance', 'Divorce', 'Comeback'],
    totalEpisodes: 91,
    status: 'ongoing',
    views: 9120000,
    likes: 455100,
    trending: true,
    isNew: true,
    freeEpisodes: 15,
  },
  {
    title: 'My Triple Identity Husband',
    description:
      'By day, Ethan is the shy janitor of Sterling Tower who brings coffee to junior designer Chloe. By night he is the mysterious investor everyone fears, and in the shadows \u2014 the heir of the city\u2019s most powerful dynasty. When Chloe is framed by her rival, the quiet janitor tears off his disguise in front of the whole company. Three identities, one secret, and a wife who has no idea she married all of them.',
    genre: 'Romance',
    tags: ['Hidden Identity', 'Sweet Love', 'Power Couple'],
    totalEpisodes: 64,
    status: 'completed',
    views: 7650000,
    likes: 341800,
    mustSee: true,
    trending: true,
    freeEpisodes: 10,
  },
  {
    title: 'The Maid\u2019s Secret Twins',
    description:
      'Five years ago, housekeeper Sara fled the Whitmore estate carrying a secret the master would kill to control. Now she\u2019s back \u2014 with two identical four-year-olds who look exactly like cold billionaire Damian Whitmore. The twins have one mission: matchmake their mommy and daddy. But Damian\u2019s fianc\u00e9e and the family\u2019s dark past stand in the way, and the truth about that night five years ago is more dangerous than anyone imagined.',
    genre: 'Family',
    tags: ['Billionaire', 'Cute Babies', 'Second Chance', 'Sweet'],
    totalEpisodes: 80,
    status: 'ongoing',
    views: 11340000,
    likes: 522900,
    featured: true,
    trending: true,
    freeEpisodes: 14,
  },
  {
    title: 'Midnight Gamble: Lady of the Underworld',
    description:
      'Casino heiress Ruby lost everything in one rigged hand \u2014 her empire, her father, her name. Three years later she returns to the felt with a new face and a photographic memory that can read every shuffle. Her only rule: never trust anyone. Then the city\u2019s most feared underworld broker offers her a partnership that could take down the family who ruined her \u2014 if she\u2019s willing to gamble her heart one last time.',
    genre: 'Urban',
    tags: ['Strong Female Lead', 'Casino', 'Underworld', 'Suspense'],
    totalEpisodes: 72,
    status: 'completed',
    views: 6890000,
    likes: 298500,
    hiddenGem: true,
    freeEpisodes: 10,
  },
  {
    title: 'The Vampire Lord\u2019s Human Pet',
    description:
      'Sold to the midnight auction to pay her brother\u2019s debt, Olivia catches the eye of Lucian \u2014 the vampire lord who owns the city after dark. Instead of a meal, she becomes his "pet", bound by a blood contract she can\u2019t break. But Lucian has a secret: she is the only human whose blood can heal him, and the council has ordered her death. Now her cold captor is becoming her most dangerous protector.',
    genre: 'Fantasy',
    tags: ['Vampire', 'Dark Romance', 'Supernatural', 'Contract'],
    totalEpisodes: 77,
    status: 'ongoing',
    views: 9870000,
    likes: 466300,
    trending: true,
    isNew: true,
    freeEpisodes: 11,
  },
  {
    title: 'Flash Marriage to the Military Doctor',
    description:
      'When surgeon Claire\u2019s fianc\u00e9 cheats on her the week of the wedding, she does the unthinkable \u2014 marries the wounded stranger who collapsed outside the hospital. She thinks he\u2019s a poor military doctor. He\u2019s actually the youngest general in the country with three medals hidden in his closet. Between hospital shifts and base deployments, their fake marriage keeps getting dangerously real.',
    genre: 'Romance',
    tags: ['Flash Marriage', 'Military', 'Doctor', 'Sweet Love'],
    totalEpisodes: 70,
    status: 'completed',
    views: 8230000,
    likes: 387600,
    mustSee: true,
    freeEpisodes: 12,
  },
  {
    title: 'Scandal: The Understudy\u2019s Rise',
    description:
      ' Ensemble dancer Ivy has been told she\u2019s nothing but an understudy her whole career. When the star ballerina breaks her ankle on opening night, Ivy steps into the spotlight \u2014 and into a scandal orchestrated to destroy her. With a ruined reputation and a viral clip she never filmed, Ivy partners with the one journalist investigating her frame-up. Together they\u2019ll expose an empire built on stolen dreams.',
    genre: 'Urban',
    tags: ['Entertainment Industry', 'Strong Female Lead', 'Comeback'],
    totalEpisodes: 58,
    status: 'completed',
    views: 5430000,
    likes: 231400,
    hiddenGem: true,
    freeEpisodes: 9,
  },
  {
    title: 'Grandma\u2019s Fortune: The Forgotten Granddaughter',
    description:
      'The Hart family fought for years over wealthy Grandma Hart\u2019s inheritance \u2014 everyone except quiet caretaker granddaughter Penny, who simply read her books and made her tea. So when the will is read, the whole family collapses: the entire fortune goes to the one who never asked. Now the vultures are circling with fake love and lawsuits, and Penny\u2019s childhood best friend \u2014 now a powerful lawyer \u2014 stands between her and the trap.',
    genre: 'Family',
    tags: ['Inheritance', 'Face-Slapping', 'Warmth', 'Rich Family'],
    totalEpisodes: 63,
    status: 'completed',
    views: 7210000,
    likes: 312000,
    mustSee: true,
    freeEpisodes: 10,
  },
  {
    title: 'Mafia Boss\u2019s Deaf Wife',
    description:
      'Everyone in the city fears Adrian Moretti. Nobody knows his safest place is a quiet art studio where a deaf painter named Sophie teaches him silence. Married by arrangement to secure a truce, Sophie expects a monster. Instead she finds a man learning sign language in secret, spelling out "good morning" with shaking hands. But Adrian\u2019s enemies have noticed his one weakness \u2014 and Sophie is about to paint her way out of a war.',
    genre: 'Romance',
    tags: ['Mafia', 'Touching', 'Arranged Marriage', 'Protective'],
    totalEpisodes: 86,
    status: 'ongoing',
    views: 13520000,
    likes: 601400,
    featured: true,
    mustSee: true,
    trending: true,
    freeEpisodes: 12,
  },
  {
    title: 'The Substitute Groom',
    description:
      'Billionaire Ryan needs a wife for 30 days to inherit \u2014 any wife. His overworked assistant Jessica says no. So he offers her three months\u2019 salary and one rule: smile at the cameras. But between staged photo shoots and a jealous ex who won\u2019t quit, the fake smiles start feeling real. When the 30 days end, Ryan must choose between the inheritance and the assistant who knows every one of his secrets.',
    genre: 'Romance',
    tags: ['Contract Marriage', 'Office Romance', 'Sweet Love'],
    totalEpisodes: 55,
    status: 'completed',
    views: 6340000,
    likes: 276800,
    hiddenGem: true,
    isNew: true,
    freeEpisodes: 8,
  },
  {
    title: 'Academy of the Cursed Rose',
    description:
      'Scholarship student Aria receives an invitation to Blackthorn Academy \u2014 a school where the rose garden blooms only at midnight and the four house leaders rule like kings. Every student carries a curse; every curse hides a debt. When Aria\u2019s touch starts healing the cursed, the leaders want her secret, the headmaster wants her gone, and the rose that killed her mother is blooming again.',
    genre: 'Fantasy',
    tags: ['Magic Academy', 'Mystery', 'Supernatural', 'Reverse Harem'],
    totalEpisodes: 78,
    status: 'ongoing',
    views: 8920000,
    likes: 423500,
    trending: true,
    isNew: true,
    freeEpisodes: 11,
  },
  {
    title: 'Billionaire\u2019s Runaway Nanny',
    description:
      'Nanny Emma signed up to care for one child \u2014 not five. Five motherless kids, one frozen-hearted tech billionaire, and a mansion with more cameras than smiles. Emma breaks every rule in the nanny handbook: park ice cream before dinner, pillow fights past bedtime, and never, ever fall for the boss. One year later, paparazzi catch the kids crying at her departure \u2014 and the whole world watches the coldest CEO in Silicon Valley beg on live TV.',
    genre: 'Family',
    tags: ['Billionaire', 'Nanny', 'Cute Kids', 'Healing'],
    totalEpisodes: 68,
    status: 'completed',
    views: 7890000,
    likes: 358900,
    mustSee: true,
    freeEpisodes: 10,
  },
  {
    title: 'Detective Li\u2019s Cold Cases',
    description:
      'Detective Marcus Li solves the cases nobody wants: the ones the city already buried. Each episode pulls him deeper into one unsolved mystery \u2014 a bride who vanished at her own wedding, a hit-and-run with no car, a witness who only speaks in riddles. But the closer he gets to the truth of his partner\u2019s death, the more he realizes every cold case points back to the same man. And that man knows Li is coming.',
    genre: 'Mystery',
    tags: ['Detective', 'Crime', 'Suspense', 'Smart Male Lead'],
    totalEpisodes: 48,
    status: 'completed',
    views: 4560000,
    likes: 198700,
    hiddenGem: true,
    freeEpisodes: 8,
  },
  {
    title: 'Queen of the Kitchen',
    description:
      'Street-food cook Tess has one goal: save her grandmother\u2019s noodle shop from the developer bulldozing the block. When a covert food critic accidentally posts her braised pork recipe, the internet explodes \u2014 and so does the competition. Thrown into a cutthroat culinary contest she never entered, Tess battles trained chefs, sabotaged kitchens, and the annoyingly handsome hotel heir judging every dish. Her secret weapon? Grandma\u2019s unfinished recipe book \u2014 and a fire nobody can buy out.',
    genre: 'Urban',
    tags: ['Food', 'Competition', 'Strong Female Lead', 'Feel-Good'],
    totalEpisodes: 60,
    status: 'completed',
    views: 5670000,
    likes: 245300,
    hiddenGem: true,
    isNew: true,
    freeEpisodes: 10,
  },
  {
    title: 'The Fortune Teller\u2019s Prophecy',
    description:
      'Every prophecy Wren speaks comes true \u2014 except the ones about herself. When she foresees the death of cold CEO Julian Frost in exactly seven days, she does the math: stay quiet and live, or save the man the whole city hates. She saves him. Now the timeline is fighting back with escalating accidents, and Julian \u2014 who remembers dying once before \u2014 knows she\u2019s the only one who can rewrite fate. The cost of the rewrite: someone she loves.',
    genre: 'Mystery',
    tags: ['Supernatural', 'Fate', 'Suspense', 'Countdown'],
    totalEpisodes: 66,
    status: 'ongoing',
    views: 6780000,
    likes: 302100,
    trending: true,
    isNew: true,
    freeEpisodes: 9,
  },
  {
    title: 'Snowbound with My Ex-Boss',
    description:
      'Marketing director Grace planned the perfect solo Christmas in a mountain cabin: no phone, no deadlines, no memories of being fired. Then a blizzard strands her with the last person on earth \u2014 Damien Cross, the boss who signed the termination letter. One fireplace, one week of snow, and every unsaid word between them thawing faster than the road. By the time the snowplow comes, neither wants to leave. But back in the city, the board has a new plan: her promotion \u2014 to his rival company.',
    genre: 'Romance',
    tags: ['Ex-Boss', 'Snowed In', 'Second Chance', 'Holiday'],
    totalEpisodes: 45,
    status: 'completed',
    views: 5120000,
    likes: 224600,
    hiddenGem: true,
    freeEpisodes: 8,
  },
  {
    title: 'The Bodyguard\u2019s Vow',
    description:
      'Ex-special-forces captain Jake took one vow after the mission that cost his team everything: never guard anyone again. Then pop superstar Selena receives her fourth death threat in a month, and her manager begs the one man no assassin has ever gotten past. Jake\u2019s rules are simple: stay professional, stay invisible, never get attached. Selena\u2019s rules are simpler: make him laugh once a day. Between stadium tours and sniper warnings, both vows are about to break.',
    genre: 'Romance',
    tags: ['Bodyguard', 'Celebrity', 'Protective', 'Action'],
    totalEpisodes: 74,
    status: 'ongoing',
    views: 9540000,
    likes: 443200,
    featured: true,
    mustSee: true,
    freeEpisodes: 12,
  },
  {
    title: 'Village Girl, City Queen',
    description:
      'With a borrowed suit and 200 yuan, farm girl Bingwen steps off the train into Shenzhen, 1998. Factory floor by day, night school by desk lamp, she climbs from sewing machine to boardroom while everyone tells her girls from her village end up in one place. Twenty years, one textiles empire, and countless betrayals later, she returns home in a Bentley \u2014 to buy the mountain her father died farming, and build the school she never had.',
    genre: 'Family',
    tags: ['Rags to Riches', 'Era Drama', 'Inspirational', 'Sagas'],
    totalEpisodes: 95,
    status: 'completed',
    views: 8760000,
    likes: 401200,
    mustSee: true,
    hiddenGem: true,
    freeEpisodes: 15,
  },
  {
    title: 'Trial Marriage with the Doctor Next Door',
    description:
      'Divorce lawyer Harper has seen every way love fails \u2014 so she drafts her own marriage contract with a 6-month exit clause. Her counterparty: Dr. Noah Reed, the ER neighbor who stitched her hand and listened to her rant about prenups. Rule one: no feelings. Rule two: separate bedrooms. Rule three: review the contract monthly. The clauses keep getting amended \u2014 dinner together, movie nights, a shared dog named Clause. Six months later, Harper\u2019s pen hovers over the exit clause, and Noah slides a new document across the table: no end date.',
    genre: 'Romance',
    tags: ['Contract Marriage', 'Doctor', 'Neighbors', 'Feel-Good'],
    totalEpisodes: 52,
    status: 'completed',
    views: 6980000,
    likes: 318700,
    trending: true,
    isNew: true,
    freeEpisodes: 9,
  },
]

const EP_TITLES = [
  'The Beginning', 'Unexpected Encounter', 'A Dangerous Deal', 'Under the Spotlight', 'The Secret Clause',
  'Midnight Confession', 'Old Wounds', 'The Invitation', 'Mask Off', 'One Last Chance',
  'The Trap', 'True Colors', 'On the Run', 'The Betrayal', 'Broken Promises',
  'Rising Storm', 'The Reveal', 'Counterattack', 'All or Nothing', 'New Dawn',
]

async function main() {
  console.log('Clearing existing data...')
  await prisma.watchProgress.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.episode.deleteMany()
  await prisma.drama.deleteMany()

  console.log('Seeding dramas...')
  for (let i = 0; i < DRAMAS.length; i++) {
    const d = DRAMAS[i]
    const drama = await prisma.drama.create({
      data: {
        title: d.title,
        description: d.description,
        genre: d.genre,
        tags: JSON.stringify(d.tags),
        coverTheme: i % 12,
        totalEpisodes: d.totalEpisodes,
        status: d.status,
        views: d.views,
        likes: d.likes,
        featured: d.featured ?? false,
        trending: d.trending ?? false,
        mustSee: d.mustSee ?? false,
        hiddenGem: d.hiddenGem ?? false,
        isNew: d.isNew ?? false,
      },
    })

    const freeCount = d.freeEpisodes ?? 10
    const epData = []
    for (let n = 1; n <= d.totalEpisodes; n++) {
      epData.push({
        dramaId: drama.id,
        number: n,
        title: EP_TITLES[(n - 1) % EP_TITLES.length],
        videoUrl: VIDEOS[(i + n) % VIDEOS.length],
        duration: 60 + ((n * 37) % 150),
        isFree: n <= freeCount,
        likes: Math.floor(Math.random() * 45000) + 2000,
      })
    }
    // batch insert
    const chunk = 20
    for (let c = 0; c < epData.length; c += chunk) {
      await prisma.episode.createMany({ data: epData.slice(c, c + chunk) })
    }
    console.log(`  \u2713 ${d.title} (${d.totalEpisodes} episodes)`)
  }

  const total = await prisma.drama.count()
  const totalEp = await prisma.episode.count()
  console.log(`Done! ${total} dramas, ${totalEp} episodes.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
