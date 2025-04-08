import { Question } from '../../types';
import { ref, set, push } from 'firebase/database';
import { rtdb, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

// Categories for the quiz
const categories = [
  "Opšte znanje",
  "Istorija",
  "Geografija",
  "Film i TV",
  "Muzika",
  "Sport"
];

// Questions by category
const allQuestions: Question[][] = [
  // Category 1: Opšte znanje
  [
    {
      id: 'oz1',
      text: 'Koji je glavni grad Srbije?',
      options: ['Niš', 'Beograd', 'Novi Sad', 'Kragujevac'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oz2',
      text: 'Koliko ima slova u srpskoj ćirilici?',
      options: ['30', '32', '33', '36'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oz3',
      text: 'Ko je napisao roman "Na Drini ćuprija"?',
      options: ['Mesa Selimović', 'Ivo Andrić', 'Branislav Nušić', 'Miloš Crnjanski'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oz4',
      text: 'Koji je hemijski simbol za zlato?',
      options: ['Zl', 'Ag', 'Au', 'Ar'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oz5',
      text: 'Koliko stepeni ima krug?',
      options: ['180', '270', '360', '390'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oz6',
      text: 'Ko je izumeo telefon?',
      options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Isaac Newton'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oz7',
      text: 'Koje godine je počeo Prvi svetski rat?',
      options: ['1912', '1914', '1916', '1918'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oz8',
      text: 'Koji je najveći okean na svetu?',
      options: ['Atlantski', 'Tihi', 'Indijski', 'Južni'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Opšte znanje',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Category 2: Istorija
  [
    {
      id: 'is1',
      text: 'Koje godine je pala Vizantija?',
      options: ['1389', '1453', '1492', '1521'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'is2',
      text: 'Koji vladar je ujedinio Nemačku 1871. godine?',
      options: ['Vilhelm I', 'Fridrih Veliki', 'Oto fon Bizmark', 'Hajnrih Himler'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'hard',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'is3',
      text: 'Ko je bio prvi predsednik Sjedinjenih Američkih Država?',
      options: ['Tomas Džeferson', 'Džon Adams', 'Džordž Vašington', 'Abraham Linkoln'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'is4',
      text: 'Koje godine je počela Francuska revolucija?',
      options: ['1776', '1789', '1804', '1812'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'is5',
      text: 'Ko je bio prvi car Rimskog carstva?',
      options: ['Julije Cezar', 'Avgust', 'Neron', 'Kaligula'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'is6',
      text: 'Koja velika bitka se dogodila 1389. godine?',
      options: ['Maričanska bitka', 'Kosovska bitka', 'Mohačka bitka', 'Angora'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'is7',
      text: 'Koji istorijski događaj je označio kraj Srednjeg veka?',
      options: ['Pad Carigrada', 'Otkriće Amerike', 'Gutenbergov pronalazak štampe', 'Kuga u Evropi'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'hard',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'is8',
      text: 'Koje godine je završen Drugi svetski rat?',
      options: ['1943', '1944', '1945', '1946'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Istorija',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Category 3: Geografija
  [
    {
      id: 'geo1',
      text: 'Koja je najduža reka na svetu?',
      options: ['Amazon', 'Nil', 'Jangce', 'Mississippi'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'geo2',
      text: 'Koja je najmanja država na svetu po površini?',
      options: ['Monako', 'Vatikan', 'San Marino', 'Lihtenštajn'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'geo3',
      text: 'Koji je najviši planinski vrh na svetu?',
      options: ['K2', 'Mont Everest', 'Kangčendženga', 'Makalu'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'geo4',
      text: 'Koja država ima najviše stanovnika?',
      options: ['Indija', 'Kina', 'SAD', 'Indonezija'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'geo5',
      text: 'Koji kontinent ima najviše država?',
      options: ['Afrika', 'Azija', 'Evropa', 'Južna Amerika'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'geo6',
      text: 'Koja planina je najviša u Evropi?',
      options: ['Elbrus', 'Monblan', 'Materhorn', 'Gran Paradiso'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'geo7',
      text: 'Koji glavni grad se nalazi najsevernije?',
      options: ['Oslo', 'Stokholm', 'Helsinki', 'Rejkjavik'],
      correctOptionIndex: 3,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'hard',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'geo8',
      text: 'Koja država ima najveću površinu?',
      options: ['Kanada', 'Kina', 'SAD', 'Rusija'],
      correctOptionIndex: 3,
      timeLimit: 30,
      points: 100,
      category: 'Geografija',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Category 4: Film i TV
  [
    {
      id: 'ft1',
      text: 'Koji film je osvojio najviše Oskara?',
      options: ['Titanik', 'Ben-Hur', 'Gospodar prstenova: Povratak kralja', 'Avatar'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ft2',
      text: 'Ko je režirao film "Pulp Fiction"?',
      options: ['Martin Scorsese', 'Quentin Tarantino', 'Steven Spielberg', 'Christopher Nolan'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ft3',
      text: 'Koji glumac je glumio James Bonda najduže?',
      options: ['Sean Connery', 'Roger Moore', 'Daniel Craig', 'Pierce Brosnan'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'hard',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ft4',
      text: 'Koja TV serija ima najviše epizoda?',
      options: ['Simpsoni', 'Dr Who', 'Coronation Street', 'General Hospital'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'hard',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ft5',
      text: 'Koji glumac je igrao ulogu Harry Pottera u filmovima?',
      options: ['Rupert Grint', 'Daniel Radcliffe', 'Tom Felton', 'Matthew Lewis'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ft6',
      text: 'Ko je režirao film "Jaws"?',
      options: ['Steven Spielberg', 'George Lucas', 'Francis Ford Coppola', 'Martin Scorsese'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ft7',
      text: 'U kojoj godini je izašao prvi Star Wars film?',
      options: ['1975', '1977', '1980', '1983'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ft8',
      text: 'Koja kompanija je producirala filmove kao što su "Toy Story" i "Finding Nemo"?',
      options: ['DreamWorks', 'Warner Bros', 'Pixar', 'Universal Studios'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Film i TV',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Category 5: Muzika
  [
    {
      id: 'muz1',
      text: 'Koji bend je izdao album "Dark Side of the Moon"?',
      options: ['The Beatles', 'Led Zeppelin', 'Pink Floyd', 'The Rolling Stones'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'muz2',
      text: 'Koji instrument ima 88 tipki?',
      options: ['Gitara', 'Klavir', 'Violina', 'Harmonika'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'muz3',
      text: 'Ko je bio frontmen benda Queen?',
      options: ['Roger Taylor', 'Brian May', 'Freddie Mercury', 'John Deacon'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'muz4',
      text: 'Koja pevačica je poznata kao "Queen of Pop"?',
      options: ['Madonna', 'Beyoncé', 'Lady Gaga', 'Rihanna'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'muz5',
      text: 'Koji muzički festival se održava u Glastonberiju, Engleska?',
      options: ['Coachella', 'Woodstock', 'Glastonbury Festival', 'Tomorrowland'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'muz6',
      text: 'Koji je najprodavaniji album svih vremena?',
      options: ['Thriller - Michael Jackson', 'Back in Black - AC/DC', 'The Dark Side of the Moon - Pink Floyd', 'Their Greatest Hits - Eagles'],
      correctOptionIndex: 0,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'muz7',
      text: 'Ko je komponovao "Četiri godišnja doba"?',
      options: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Johann Sebastian Bach', 'Antonio Vivaldi'],
      correctOptionIndex: 3,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'muz8',
      text: 'Iz koje države potiče muzički stil reggae?',
      options: ['Kuba', 'Jamajka', 'Brazil', 'Portoriko'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Muzika',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Category 6: Sport
  [
    {
      id: 'sp1',
      text: 'Koliko igrača čini fudbalski tim?',
      options: ['9', '10', '11', '12'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sp2',
      text: 'Koji sport koristi reket i pernatog lopticu?',
      options: ['Tenis', 'Skvoš', 'Badminton', 'Ping pong'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sp3',
      text: 'Ko je osvojio najviše Ballon d\'Or nagrada?',
      options: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Diego Maradona'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sp4',
      text: 'Koji grad je domaćin Olimpijskih igara 2024. godine?',
      options: ['Tokio', 'Los Angeles', 'Pariz', 'London'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sp5',
      text: 'U kom sportu se koristi termin "strike out"?',
      options: ['Košarka', 'Kriket', 'Bejzbol', 'Golf'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sp6',
      text: 'Koja država je osvojila najviše FIFA Svetskih prvenstava?',
      options: ['Nemačka', 'Argentina', 'Brazil', 'Italija'],
      correctOptionIndex: 2,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sp7',
      text: 'Koliko prstena ima na Olimpijskoj zastavi?',
      options: ['4', '5', '6', '7'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sp8',
      text: 'Koja teniserka ima najviše Grand Slam titula?',
      options: ['Serena Williams', 'Margaret Court', 'Steffi Graf', 'Martina Navratilova'],
      correctOptionIndex: 1,
      timeLimit: 30,
      points: 100,
      category: 'Sport',
      difficulty: 'hard',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
];

export async function seedData() {
  try {
    // Create a game session with all questions
    const gamesRef = ref(rtdb, 'games');
    const newGameRef = push(gamesRef);
    
    await set(newGameRef, {
      id: newGameRef.key,
      hostId: 'seed-user',
      status: 'waiting',
      players: [],
      currentQuestionIndex: 0,
      currentCategory: 0,
      currentRound: 0,
      questions: allQuestions,
      categories: categories,
      showLeaderboard: false,
      isPaused: false,
      timeRemaining: 30,
      showingCorrectAnswer: false,
      allPlayersAnswered: false,
      roundCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Game created successfully with ID: ${newGameRef.key}`);
    return newGameRef.key;
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Ako se fajl pokrene direktno, izvrši seedData funkciju
// Ovo neće raditi u pregledaču, samo u Node.js okruženju
if (typeof process !== 'undefined' && process.argv.length > 1) {
  seedData()
    .then(() => {
      console.log('Game created successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding data:', error);
      process.exit(1);
    });
} 