import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { StatsService } from '@/lib/services/statsServices';
import { StatsRepository } from '@/lib/repositories/statsRepository';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new StatsRepository();
    const statsService = new StatsService(repository);

    const stats = await statsService.getGlobalStats();

    console.log("GLOBAL STATS ", stats)
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}