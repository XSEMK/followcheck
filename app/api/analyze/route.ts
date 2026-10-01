import { NextResponse } from "next/server";
import JSZip from "jszip";

import {
  extractUsernamesFromHtml,
  extractPendingUsernamesFromHtml,
} from "@/lib/instagram-parser";

import {
  findNotFollowingBack,
  findNotFollowedByYou,
} from "@/lib/compare";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_ZIP_FILES = 100;
const MAX_HTML_SIZE = 10 * 1024 * 1024;

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

  const text = await file.async("text");

  if (text.length > MAX_HTML_SIZE) {
    throw new Error(
      `Fișierul ${filename} este prea mare pentru a fi procesat.`
    );
  }

  return text;
}

export async function POST(request: Request) {
  try {
    const contentLength =
      request.headers.get("content-length");

    if (contentLength) {
      const size = Number(contentLength);

      if (
        Number.isFinite(size) &&
        size > MAX_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              "Arhiva este prea mare. Limita pentru această versiune este de 4 MB.",
          },
          { status: 413 }
        );
      }
    }

    const formData =
      await request.formData();

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
      file.size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Arhiva este prea mare. Limita pentru această versiune este de 4 MB.",
        },
        { status: 413 }
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

    const buffer =
      await file.arrayBuffer();

    const zip =
      await JSZip.loadAsync(buffer);

    const files = Object.keys(
      zip.files
    ).filter(
      (name) =>
        !zip.files[name].dir
    );

    if (
      files.length > MAX_ZIP_FILES
    ) {
      return NextResponse.json(
        {
          error:
            "Arhiva conține prea multe fișiere și nu poate fi procesată.",
        },
        { status: 400 }
      );
    }

    const followersFile =
      files.find(
        (name) =>
          name
            .toLowerCase()
            .endsWith(
              "followers_1.html"
            )
      );

    const followingFile =
      files.find(
        (name) =>
          name
            .toLowerCase()
            .endsWith(
              "following.html"
            )
      );

    const pendingFile =
      files.find(
        (name) =>
          name
            .toLowerCase()
            .endsWith(
              "pending_follow_requests.html"
            )
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

    let pending: string[] = [];

    if (pendingFile) {
      const pendingHtml =
        await readText(
          zip,
          pendingFile
        );

      pending =
        extractPendingUsernamesFromHtml(
          pendingHtml
        );
    }

    if (
      followers.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Am găsit followers_1.html, dar nu am putut extrage conturile din el.",
        },
        { status: 400 }
      );
    }

    if (
      following.length === 0
    ) {
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

    return NextResponse.json({
      followersCount:
        followers.length,

      followingCount:
        following.length,

      pendingCount:
        pending.length,

      pending,

      notFollowingBack,

      notFollowedByYou,
    });
  } catch (error) {
    console.error(
      "Instagram analysis failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          "Exportul Instagram nu a putut fi procesat. Verifică arhiva și încearcă din nou.",
      },
      { status: 500 }
    );
  }
}