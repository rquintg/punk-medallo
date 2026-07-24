import { NextResponse } from 'next/server'
import { getTransaction } from '@/lib/wompi'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const transaction = await getTransaction(id)
    return NextResponse.json({ status: transaction?.status ?? null })
  } catch {
    return NextResponse.json({ status: null })
  }
}
