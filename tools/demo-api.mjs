import http from 'node:http';

const now = new Date();
const isoInDays = (days, hour = 14) => {
  const value = new Date(now);
  value.setDate(value.getDate() + days);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
};

const user = {
  id: 'demo-user',
  name: 'Marina Costa',
  email: 'teste@studyvest.app',
  dailyGoalMin: 180,
  createdAt: '2026-02-03T12:00:00.000Z',
};

const subjects = [
  { id: 'mat', name: 'Matemática', color: '#315C8A', _count: { topics: 3 } },
  { id: 'fis', name: 'Física', color: '#D97745', _count: { topics: 2 } },
  { id: 'bio', name: 'Biologia', color: '#5A8F62', _count: { topics: 2 } },
  { id: 'hist', name: 'História', color: '#9A6B45', _count: { topics: 2 } },
  { id: 'port', name: 'Português', color: '#755B9C', _count: { topics: 2 } },
  { id: 'red', name: 'Redação', color: '#C8604C', _count: { topics: 1 } },
];

const topic = (id, subjectId, name, status, priority, difficulty) => ({
  id,
  subjectId,
  name,
  status,
  priority,
  difficulty,
  fuvestImportance: 5,
  enemImportance: 5,
  subject: subjects.find((subject) => subject.id === subjectId),
});

const topics = [
  topic('fun', 'mat', 'Funções', 'REVISANDO', 'ALTA', 'MEDIO'),
  topic('geo', 'mat', 'Geometria plana', 'ESTUDANDO', 'URGENTE', 'DIFICIL'),
  topic('prob', 'mat', 'Probabilidade', 'DOMINADO', 'MEDIA', 'MEDIO'),
  topic('cin', 'fis', 'Cinemática', 'REVISANDO', 'ALTA', 'MEDIO'),
  topic('din', 'fis', 'Dinâmica', 'PENDENTE', 'MEDIA', 'DIFICIL'),
  topic('eco', 'bio', 'Ecologia', 'DOMINADO', 'MEDIA', 'FACIL'),
  topic('gen', 'bio', 'Genética', 'ESTUDANDO', 'ALTA', 'DIFICIL'),
  topic('col', 'hist', 'Brasil Colônia', 'DOMINADO', 'MEDIA', 'MEDIO'),
  topic('var', 'hist', 'Era Vargas', 'PENDENTE', 'MEDIA', 'MEDIO'),
  topic('int', 'port', 'Interpretação de texto', 'REVISANDO', 'ALTA', 'MEDIO'),
  topic('sin', 'port', 'Sintaxe', 'PENDENTE', 'MEDIA', 'DIFICIL'),
  topic('proj', 'red', 'Projeto de texto', 'ESTUDANDO', 'ALTA', 'MEDIO'),
];

const reviews = [
  { id: 'r1', topicId: 'geo', dueDate: isoInDays(-2), intervalDays: 7, status: 'ATRASADA', topic: topics[1] },
  { id: 'r2', topicId: 'fun', dueDate: isoInDays(0), intervalDays: 1, status: 'PENDENTE', topic: topics[0] },
  { id: 'r3', topicId: 'cin', dueDate: isoInDays(1), intervalDays: 7, status: 'PENDENTE', topic: topics[3] },
];

const schedules = [
  {
    id: 's1',
    subjectId: 'mat',
    topicId: 'geo',
    title: 'Lista de geometria',
    date: isoInDays(0, 15),
    durationMin: 50,
    status: 'PLANEJADO',
    notes: 'Questões FUVEST',
    subject: subjects[0],
    topic: topics[1],
  },
  {
    id: 's2',
    subjectId: 'bio',
    topicId: 'gen',
    title: 'Revisão de genética',
    date: isoInDays(0, 17),
    durationMin: 40,
    status: 'PLANEJADO',
    subject: subjects[2],
    topic: topics[6],
  },
];

const questions = [
  {
    id: 'q1',
    topicId: 'fun',
    examType: 'FUVEST',
    year: 2025,
    institution: 'FUVEST',
    difficulty: 'MEDIO',
    isCorrect: true,
    timeSpentSec: 180,
    createdAt: isoInDays(-6),
    topic: topics[0],
    mistake: null,
  },
  {
    id: 'q2',
    topicId: 'geo',
    examType: 'ENEM',
    year: 2024,
    institution: 'INEP',
    difficulty: 'DIFICIL',
    isCorrect: false,
    timeSpentSec: 320,
    errorNote: 'Confundi semelhança com congruência.',
    createdAt: isoInDays(-3),
    topic: topics[1],
    mistake: null,
  },
];

const mistakes = [];
const essays = [
  { id: 'e1', theme: 'Desafios da inclusão digital', date: isoInDays(-25), score: 720, comp1: 160, comp2: 120, comp3: 160, comp4: 160, comp5: 120, feedback: 'Fortalecer a proposta de intervenção.' },
  { id: 'e2', theme: 'Caminhos para valorizar a ciência', date: isoInDays(-9), score: 800, comp1: 160, comp2: 160, comp3: 160, comp4: 160, comp5: 160, feedback: 'Boa progressão argumentativa.' },
];

const suggestions = [
  { subjectId: 'mat', subjectName: 'Matemática', topicId: 'geo', topicName: 'Geometria plana', durationMin: 30, reason: 'Revisão atrasada' },
  { subjectId: 'bio', subjectName: 'Biologia', topicId: 'gen', topicName: 'Genética', durationMin: 50, reason: 'Prioridade alta' },
  { subjectId: 'port', subjectName: 'Português', topicId: 'int', topicName: 'Interpretação de texto', durationMin: 50, reason: 'Prioridade alta' },
  { subjectId: 'fis', subjectName: 'Física', topicId: 'din', topicName: 'Dinâmica', durationMin: 50, reason: 'Baixo desempenho em questões' },
];

function send(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  });
  response.end(JSON.stringify(payload));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1:3333');
  const path = url.pathname;

  if (request.method === 'OPTIONS') return send(response, 204, {});
  if (path === '/api/health') return send(response, 200, { status: 'ok' });
  if (path === '/api/auth/login') return send(response, 200, { user, token: 'demo-token' });
  if (path === '/api/auth/me') return send(response, 200, { user });
  if (path === '/api/subjects') return send(response, 200, { subjects });
  if (path === '/api/topics') return send(response, 200, { topics });
  if (path === '/api/study-sessions') return send(response, 200, { sessions: [] });
  if (path === '/api/reviews/today') return send(response, 200, { total: 2, overdueCount: 1, reviews: reviews.slice(0, 2) });
  if (path === '/api/reviews') return send(response, 200, { reviews });
  if (path === '/api/questions/statistics') {
    return send(response, 200, {
      flat: [
        { subject: 'Matemática', topic: 'Geometria plana', topicId: 'geo', total: 8, correct: 4, accuracyPercent: 50, reviewPriority: 50 },
        { subject: 'Física', topic: 'Dinâmica', topicId: 'din', total: 6, correct: 4, accuracyPercent: 67, reviewPriority: 33 },
      ],
    });
  }
  if (path === '/api/questions') return send(response, 200, { questions });
  if (path === '/api/mistakes/recurring') return send(response, 200, { total: 0, byReason: [], bySubjectAndReason: [] });
  if (path === '/api/mistakes') return send(response, 200, { mistakes });
  if (path === '/api/essays/evolution') {
    return send(response, 200, {
      evolution: [...essays].reverse(),
      averageByCompetency: [
        { competency: 'comp1', average: 160 },
        { competency: 'comp2', average: 140 },
        { competency: 'comp3', average: 160 },
        { competency: 'comp4', average: 160 },
        { competency: 'comp5', average: 140 },
      ],
    });
  }
  if (path === '/api/essays') return send(response, 200, { essays: [...essays].reverse() });
  if (path === '/api/schedules/suggestions') {
    return send(response, 200, {
      minutesAvailable: 180,
      minutesAllocated: 180,
      minutesRemaining: 0,
      suggestedBlocks: suggestions,
    });
  }
  if (path === '/api/schedules') return send(response, 200, { schedules });
  if (path === '/api/dashboard/charts') {
    return send(response, 200, {
      accuracyEvolution: [
        { week: isoInDays(-35), accuracyPercent: 52, totalQuestions: 18 },
        { week: isoInDays(-28), accuracyPercent: 58, totalQuestions: 21 },
        { week: isoInDays(-21), accuracyPercent: 63, totalQuestions: 24 },
        { week: isoInDays(-14), accuracyPercent: 61, totalQuestions: 19 },
        { week: isoInDays(-7), accuracyPercent: 72, totalQuestions: 27 },
        { week: isoInDays(0), accuracyPercent: 76, totalQuestions: 12 },
      ],
      timePerSubject: [
        { subject: 'Matemática', hours: 5.4 },
        { subject: 'Biologia', hours: 3.2 },
        { subject: 'Física', hours: 2.8 },
        { subject: 'Português', hours: 2.1 },
        { subject: 'História', hours: 1.6 },
      ],
      monthlyEvolution: [],
    });
  }
  if (path === '/api/dashboard') {
    return send(response, 200, {
      weekHoursStudied: 15.1,
      dailyGoal: { goalMin: 180, studiedMin: 80, progressPercent: 44 },
      overallProgress: 36,
      hardestSubjects: [{ subject: 'Física', color: '#D97745', difficultyScore: 66 }],
      overdueReviews: [reviews[0]],
      upcomingTasks: { reviews: reviews.slice(1), schedules },
      questionsPerformance: { total: 128, correct: 91, accuracyPercent: 71 },
    });
  }
  if (path.startsWith('/api/ai/')) {
    return send(response, 503, { error: 'A mentoria por IA ainda não foi configurada. Defina AI_PROVIDER_API_KEY no backend.' });
  }

  if (request.method === 'POST' || request.method === 'PATCH' || request.method === 'DELETE') {
    return send(response, request.method === 'DELETE' ? 204 : 200, {});
  }
  return send(response, 404, { error: 'Rota de demonstração não encontrada.' });
});

server.listen(3333, '127.0.0.1', () => {
  console.log('Demo API ativa em http://127.0.0.1:3333/api');
});
