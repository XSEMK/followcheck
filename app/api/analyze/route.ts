import { NextResponse } from "next/server";
import JSZip from "jszip";

import {
  extractUsernamesFromHtml,
} from "@/lib/instagram-parser";

import {
  findNotFollowingBack,
  findNotFollowedByYou,
} from "@/lib/compare";

export const runtime = "nodejs";

async function readText(
  zip: JSZip,
  filename: string
): Promise<string> {
  const file = zip.files[filename];

  if (!file) {
    throw new Error(
      `Fișierul ${filename} nu există în arhivă.`
    );
  }

  return await file.async("text");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Nu a fost încărcat niciun fișier.",
        },
        { status: 400 }
      );
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".zip")
    ) {
      return NextResponse.json(
        {
          error:
            "Încarcă arhiva Instagram în format .zip.",
        },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();

    const zip = await JSZip.loadAsync(buffer);

    const files = Object.keys(zip.files).filter(
      (name) => !zip.files[name].dir
    );

    const followersFile = files.find(
      (name) =>
        name.toLowerCase().endsWith("followers_1.html")
    );

    const followingFile = files.find(
      (name) =>
        name.toLowerCase().endsWith("following.html")
    );

    if (!followersFile) {
      return NextResponse.json(
        {
          error:
            "Nu am găsit followers_1.html în arhivă.",
        },
        { status: 400 }
      );
    }

    if (!followingFile) {
      return NextResponse.json(
        {
          error:
            "Nu am găsit following.html în arhivă.",
        },
        { status: 400 }
      );
    }

    const followersHtml =
      await readText(
        zip,
        followersFile
      );

    const followingHtml =
      await readText(
        zip,
        followingFile
      );

    const followers =
      extractUsernamesFromHtml(
        followersHtml
      );

    const following =
      extractUsernamesFromHtml(
        followingHtml
      );

    console.log(
      "================================"
    );

    console.log(
      "FOLLOWERS FILE:",
      followersFile
    );

    console.log(
      "FOLLOWING FILE:",
      followingFile
    );

    console.log(
      "TOTAL FOLLOWERS:",
      followers.length
    );

    console.log(
      "TOTAL FOLLOWING:",
      following.length
    );

    console.log(
      "================================"
    );

    if (followers.length === 0) {
      return NextResponse.json(
        {
          error:
            "Am găsit followers_1.html, dar nu am putut extrage conturile din el.",
        },
        { status: 400 }
      );
    }

    if (following.length === 0) {
      return NextResponse.json(
        {
          error:
            "Am găsit following.html, dar nu am putut extrage conturile din el.",
        },
        { status: 400 }
      );
    }

    const notFollowingBack =
      findNotFollowingBack(
        following,
        followers
      );

    const notFollowedByYou =
      findNotFollowedByYou(
        following,
        followers
      );

    console.log(
      "NU TE URMĂRESC ÎNAPOI:",
      notFollowingBack.length
    );

    console.log(
      "NU ÎI URMĂREȘTI:",
      notFollowedByYou.length
    );

    return NextResponse.json({
      followersCount:
        followers.length,

      followingCount:
        following.length,

      notFollowingBack,

      notFollowedByYou,
    });
  } catch (error) {
    console.error(
      "Instagram analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Exportul nu a putut fi procesat.",
      },
      { status: 500 }
    );
  }
}