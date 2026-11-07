import { NextResponse } from 'next/server';
import { CompanyRepository } from '@/lib/repositories/companyRepository';

export async function GET() {
  try {
    const companies = CompanyRepository.findAll();
    return NextResponse.json({ companies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.company_name) {
      return NextResponse.json({ error: 'company_name is required' }, { status: 400 });
    }
    const company = CompanyRepository.create(body.company_name);
    return NextResponse.json({ company }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create company' }, { status: 400 });
  }
}
