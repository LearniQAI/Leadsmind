import { NextResponse } from 'next/server';
import { handlePageFormSubmission } from '@/app/actions/builder';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, pageId, workspaceId } = body;

    if (!pageId || !workspaceId) {
      return NextResponse.json({ success: false, error: 'Missing context' }, { status: 400 });
    }

    const result = await handlePageFormSubmission(formData, pageId, workspaceId);

    if (result.success) {
      return NextResponse.json({ success: true, contactId: result.contactId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Submission Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
