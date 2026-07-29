import { PrismaClient, Difficulty, Priority, TopicStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const subjects = [
  { name: 'Matemática', color: '#315C8A', topics: ['Funções', 'Geometria plana', 'Probabilidade'] },
  { name: 'Física', color: '#D97745', topics: ['Cinemática', 'Dinâmica', 'Eletricidade'] },
  { name: 'Química', color: '#2A8C82', topics: ['Estequiometria', 'Química orgânica', 'Eletroquímica'] },
  { name: 'Biologia', color: '#5A8F62', topics: ['Ecologia', 'Genética', 'Citologia'] },
  { name: 'Português', color: '#755B9C', topics: ['Interpretação de texto', 'Sintaxe', 'Figuras de linguagem'] },
  { name: 'Literatura', color: '#9B5263', topics: ['Modernismo', 'Realismo', 'Obras obrigatórias'] },
  { name: 'História', color: '#9A6B45', topics: ['Brasil Colônia', 'Era Vargas', 'Guerra Fria'] },
  { name: 'Geografia', color: '#3B7F91', topics: ['Geopolítica', 'Urbanização', 'Climatologia'] },
  { name: 'Filosofia', color: '#5B6470', topics: ['Ética', 'Filosofia antiga', 'Filosofia moderna'] },
  { name: 'Sociologia', color: '#A65B7B', topics: ['Cultura', 'Trabalho', 'Movimentos sociais'] },
  { name: 'Inglês', color: '#3F568C', topics: ['Reading', 'Vocabulary', 'Text genres'] },
  { name: 'Redação', color: '#C8604C', topics: ['Projeto de texto', 'Repertório', 'Proposta de intervenção'] },
] as const;

async function main() {
  const passwordHash = await bcrypt.hash('senha123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'teste@studyvest.app' },
    update: {},
    create: {
      name: 'Estudante',
      email: 'teste@studyvest.app',
      passwordHash,
      dailyGoalMin: 180,
    },
  });

  for (const [subjectIndex, subjectData] of subjects.entries()) {
    const subject = await prisma.subject.upsert({
      where: { userId_name: { userId: user.id, name: subjectData.name } },
      update: { color: subjectData.color },
      create: { userId: user.id, name: subjectData.name, color: subjectData.color },
    });

    for (const [topicIndex, topicName] of subjectData.topics.entries()) {
      const priority: Priority =
        subjectIndex < 2 && topicIndex === 0 ? Priority.ALTA : Priority.MEDIA;
      const status: TopicStatus =
        subjectIndex === 0 && topicIndex === 0
          ? TopicStatus.ESTUDANDO
          : TopicStatus.NAO_INICIADO;

      const topic = await prisma.topic.findFirst({
        where: { userId: user.id, subjectId: subject.id, name: topicName },
        select: { id: true },
      });

      if (!topic) {
        await prisma.topic.create({
          data: {
          userId: user.id,
          subjectId: subject.id,
          name: topicName,
          priority,
          status,
          difficulty: topicIndex === 1 ? Difficulty.DIFICIL : Difficulty.MEDIO,
          fuvestImportance: subjectIndex < 8 ? 5 : 3,
          enemImportance: subjectIndex === 10 ? 4 : 5,
          },
        });
      }
    }
  }

  console.log('Seed concluído.');
  console.log('Acesso de demonstração: teste@studyvest.app / senha123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
