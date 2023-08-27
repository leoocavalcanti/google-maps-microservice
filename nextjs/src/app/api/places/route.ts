import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){

    const url = new URL(request.url);
    const text = url.searchParams.get("text");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/places?text=${text}`, {
        next: {
            revalidate: 1 //valor grande, cache grande
        }
    });
    return NextResponse.json(await response.json());
}