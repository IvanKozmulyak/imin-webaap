import { prisma } from '@/lib/db/client';
import { LanguageDto } from '@/lib/types/language';

export async function getAllLanguages(): Promise<LanguageDto[]> {
  const languages = await prisma.language.findMany({
    orderBy: { code: 'asc' },
  });

  return languages.map(lang => ({
    id: lang.id,
    code: lang.code,
    name: lang.name,
  }));
}
