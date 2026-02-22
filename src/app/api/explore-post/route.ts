import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized. No token." },
        { status: 401 },
      );
    }

    // ambil query params dari frontend
    const { searchParams } = new URL(request.url);
    const size = searchParams.get("size") || "10";
    const page = searchParams.get("page") || "1";

    const res = await fetch(
      `https://photo-sharing-api-bootcamp.do.dibimbing.id/api/v1/explore-post?size=${size}&page=${page}`,
      {
        headers: {
          Authorization: authHeader,
          apiKey: "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b",
        },
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { message: "External API error", error: errorText },
        { status: res.status },
      );
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 },
    );
  }
}
