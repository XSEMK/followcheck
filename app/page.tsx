"use client";

import { useMemo, useState } from "react";

type AnalysisResult = {
  followersCount: number;
  followingCount: number;
  notFollowingBack: string[];
  notFollowedByYou: string[];
};

type SortOrder = "asc" | "desc";

type FilterType =
  | "notFollowingBack"
  | "notFollowedByYou";

export default function Home() {
  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("asc");

  const [filter, setFilter] =
    useState<FilterType>(
      "notFollowingBack"
    );

  const [darkMode, setDarkMode] =
    useState(true);

  async function analyze() {
    if (!file) {
      setError(
        "Selectează mai întâi arhiva ZIP."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSearch("");
    setSortOrder("asc");
    setFilter("notFollowingBack");

    try {
      const formData =
        new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "A apărut o eroare."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "A apărut o eroare."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentUsers = useMemo(() => {
    if (!result) {
      return [];
    }

    return filter ===
      "notFollowedByYou"
      ? result.notFollowedByYou
      : result.notFollowingBack;
  }, [result, filter]);

  const filteredUsers = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    let users = currentUsers;

    if (query) {
      users = users.filter(
        (username) =>
          username
            .toLowerCase()
            .includes(query)
      );
    }

    return [...users].sort(
      (a, b) => {
        const comparison =
          a.localeCompare(b);

        return sortOrder === "asc"
          ? comparison
          : -comparison;
      }
    );
  }, [
    currentUsers,
    search,
    sortOrder,
  ]);

  const followingBackCount =
    result
      ? result.followingCount -
        result.notFollowingBack
          .length
      : 0;

  const followingBackPercentage =
    result &&
    result.followingCount > 0
      ? Math.round(
          (followingBackCount /
            result.followingCount) *
            100
        )
      : 0;

  function openInstagram(
    username: string
  ) {
    window.open(
      `https://www.instagram.com/${username}/`,
      "_blank"
    );
  }

  function getExportUsers() {
    if (!result) {
      return [];
    }

    return [
      ...(filter ===
      "notFollowedByYou"
        ? result.notFollowedByYou
        : result.notFollowingBack),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }

  function downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ) {
    const blob = new Blob(
      [content],
      {
        type: mimeType,
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function exportTxt() {
    const users =
      getExportUsers();

    if (!users.length) {
      alert(
        "Nu există conturi de exportat."
      );
      return;
    }

    const title =
      filter ===
      "notFollowedByYou"
        ? "Conturi care te urmăresc, dar tu nu îi urmărești"
        : "Conturi care nu te urmăresc înapoi";

    const text = [
      "FOLLOWCHECK",
      title,
      "",
      ...users.map(
        (username, index) =>
          `${index + 1}. @${username}`
      ),
    ].join("\n");

    downloadFile(
      text,
      "followcheck-results.txt",
      "text/plain;charset=utf-8"
    );
  }

  function exportCsv() {
    const users =
      getExportUsers();

    if (!users.length) {
      alert(
        "Nu există conturi de exportat."
      );
      return;
    }

    const category =
      filter ===
      "notFollowedByYou"
        ? "Te urmărește, dar tu nu îl urmărești"
        : "Nu te urmărește înapoi";

    const rows = [
      [
        "Nr.",
        "Username",
        "Categorie",
      ],
      ...users.map(
        (username, index) => [
          String(index + 1),
          `@${username}`,
          category,
        ]
      ),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${cell.replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    downloadFile(
      "\uFEFF" + csv,
      "followcheck-results.csv",
      "text/csv;charset=utf-8"
    );
  }

  function exportFullReport() {
    if (!result) {
      return;
    }

    const notFollowingBack =
      [
        ...result.notFollowingBack,
      ].sort((a, b) =>
        a.localeCompare(b)
      );

    const notFollowedByYou =
      [
        ...result.notFollowedByYou,
      ].sort((a, b) =>
        a.localeCompare(b)
      );

    const report = [
      "========================================",
      "              FOLLOWCHECK",
      "           RAPORT COMPLET",
      "========================================",
      "",
      "STATISTICI",
      "----------------------------------------",
      `Followers: ${result.followersCount}`,
      `Following: ${result.followingCount}`,
      `Te urmăresc înapoi: ${followingBackCount}`,
      `Procent follow-back: ${followingBackPercentage}%`,
      `Nu te urmăresc înapoi: ${notFollowingBack.length}`,
      "",
      "========================================",
      "       NU TE URMĂRESC ÎNAPOI",
      "========================================",
      "",
      ...notFollowingBack.map(
        (username, index) =>
          `${index + 1}. @${username}`
      ),
      "",
      "========================================",
      "   TE URMĂRESC, DAR TU NU ÎI URMĂREȘTI",
      "========================================",
      "",
      ...notFollowedByYou.map(
        (username, index) =>
          `${index + 1}. @${username}`
      ),
      "",
      "========================================",
      "Raport generat de FollowCheck",
      "========================================",
    ].join("\n");

    downloadFile(
      report,
      "followcheck-raport-complet.txt",
      "text/plain;charset=utf-8"
    );
  }

  async function copyList() {
    const users =
      getExportUsers();

    if (!users.length) {
      alert(
        "Nu există conturi de copiat."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(
        users
          .map(
            (username) =>
              `@${username}`
          )
          .join("\n")
      );

      alert(
        "Lista a fost copiată."
      );
    } catch {
      alert(
        "Nu am putut copia lista."
      );
    }
  }

  function selectFilter(
    nextFilter: FilterType
  ) {
    setFilter(nextFilter);
    setSearch("");
    setSortOrder("asc");
  }

  const listTitle =
    filter ===
    "notFollowedByYou"
      ? "Te urmăresc, dar tu nu îi urmărești"
      : "Nu te urmăresc înapoi";

  const listDescription =
    filter ===
    "notFollowedByYou"
      ? "Conturi care te urmăresc fără să le urmărești."
      : "Conturi pe care le urmărești, dar care nu te urmăresc.";

  const colors = darkMode
    ? {
        page: "#07070a",
        card: "rgba(255,255,255,0.035)",
        cardStrong:
          "rgba(255,255,255,0.055)",
        border:
          "rgba(255,255,255,0.09)",
        text: "#ffffff",
        muted: "#a1a1aa",
        subtle: "#52525b",
      }
    : {
        page: "#f7f7fb",
        card: "#ffffff",
        cardStrong: "#ffffff",
        border: "rgba(0,0,0,0.08)",
        text: "#111113",
        muted: "#71717a",
        subtle: "#a1a1aa",
      };

  return (
    <main
      style={{
        backgroundColor:
          colors.page,
        color: colors.text,
      }}
      className="min-h-screen overflow-x-hidden px-3 py-5 transition-colors duration-500 sm:px-6 sm:py-8"
    >

      <div className="mx-auto max-w-6xl">

        {/* NAVBAR */}

        <nav
          className="mb-8 flex items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-300 sm:mb-10 sm:px-5"
          style={{
            backgroundColor:
              darkMode
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.75)",
            borderColor:
              colors.border,
          }}
        >

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 font-black text-white shadow-lg shadow-purple-500/20">
              F
            </div>

            <div>
              <p className="text-sm font-black tracking-tight">
                Follow
                <span className="text-pink-500">
                  Check
                </span>
              </p>

              <p
                className="hidden text-[10px] sm:block"
                style={{
                  color: colors.subtle,
                }}
              >
                Instagram analytics
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition duration-300 hover:scale-105 active:scale-95"
            style={{
              borderColor:
                colors.border,
              backgroundColor:
                darkMode
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
            }}
          >
            <span className="text-base">
              {darkMode
                ? "☀️"
                : "🌙"}
            </span>

            <span className="hidden sm:inline">
              {darkMode
                ? "Light mode"
                : "Dark mode"}
            </span>
          </button>

        </nav>

        {/* HERO */}

        <header className="mb-8 text-center sm:mb-10">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-4xl font-black text-white shadow-2xl shadow-purple-500/20 transition duration-500 hover:scale-110 hover:rotate-3">
            F
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/5 px-3 py-1.5 text-xs font-semibold text-pink-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
            Instagram analytics
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
            Înțelege-ți
            <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              comunitatea.
            </span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7"
            style={{
              color: colors.muted,
            }}
          >
            FollowCheck analizează arhiva ta
            Instagram și îți arată clar cine
            te urmărește, cine nu și cum arată
            relația dintre followers și following.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span
              className="rounded-full border px-3 py-1.5"
              style={{
                borderColor:
                  colors.border,
                color: colors.muted,
              }}
            >
              🔒 Procesare locală
            </span>

            <span
              className="rounded-full border px-3 py-1.5"
              style={{
                borderColor:
                  colors.border,
                color: colors.muted,
              }}
            >
              ⚡ Rapid
            </span>

            <span
              className="rounded-full border px-3 py-1.5"
              style={{
                borderColor:
                  colors.border,
                color: colors.muted,
              }}
            >
              📊 Rapoarte
            </span>
          </div>

        </header>

        {/* UPLOAD */}

        <section
          className="overflow-hidden rounded-[32px] border shadow-2xl transition-all duration-500"
          style={{
            backgroundColor:
              colors.card,
            borderColor:
              colors.border,
          }}
        >

          <div className="p-4 sm:p-8">

            <div
              className="rounded-[28px] border border-dashed p-6 text-center transition duration-300 sm:p-12"
              style={{
                borderColor:
                  colors.border,
                backgroundColor:
                  darkMode
                    ? "rgba(0,0,0,0.15)"
                    : "rgba(0,0,0,0.015)",
              }}
            >

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500/15 to-purple-500/15 text-4xl transition duration-500 hover:scale-110">
                {loading
                  ? "⏳"
                  : "📦"}
              </div>

              <h2 className="mt-6 text-xl font-bold sm:text-2xl">
                {loading
                  ? "Analizăm arhiva..."
                  : "Începe analiza"}
              </h2>

              <p
                className="mx-auto mt-3 max-w-md text-sm leading-6"
                style={{
                  color: colors.muted,
                }}
              >
                Încarcă arhiva ZIP descărcată
                de la Instagram. Nu trebuie să
                extragi fișierele.
              </p>

              {!loading && (
                <label className="mt-7 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-purple-500/10 transition duration-200 hover:scale-[1.02] hover:shadow-purple-500/20 active:scale-[0.98] sm:w-auto">
                  📁{" "}
                  {file
                    ? "Schimbă arhiva"
                    : "Alege arhiva ZIP"}

                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(
                      event
                    ) => {
                      const selected =
                        event.target
                          .files?.[0] ||
                        null;

                      setFile(
                        selected
                      );
                      setResult(
                        null
                      );
                      setError("");
                      setSearch("");
                      setSortOrder(
                        "asc"
                      );
                      setFilter(
                        "notFollowingBack"
                      );
                    }}
                  />
                </label>
              )}

              {file && (
                <div
                  className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-xl border px-4 py-3 text-left"
                  style={{
                    borderColor:
                      colors.border,
                    backgroundColor:
                      darkMode
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.025)",
                  }}
                >
                  <span className="text-xl">
                    🗜️
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {file.name}
                    </p>

                    <p
                      className="text-xs"
                      style={{
                        color:
                          colors.subtle,
                      }}
                    >
                      Arhivă pregătită
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={analyze}
                disabled={
                  !file || loading
                }
                className="mt-5 w-full max-w-md rounded-xl bg-white px-6 py-4 font-black text-black shadow-lg transition duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white"
              >
                {loading
                  ? "⏳ Se analizează..."
                  : "✨ Analizează arhiva"}
              </button>

              {loading && (
                <div className="mx-auto mt-5 h-1.5 max-w-md overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                </div>
              )}

            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                ❌ {error}
              </div>
            )}

          </div>
        </section>

        {/* RESULTS */}

        {result && (
          <section className="animate-[slideUp_0.6s_ease-out] mt-7 sm:mt-8">

            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-pink-500">
                  Analiză finalizată
                </p>

                <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                  Dashboard-ul tău
                </h2>
              </div>

              <p
                className="text-xs sm:text-sm"
                style={{
                  color:
                    colors.subtle,
                }}
              >
                Date din arhiva Instagram
              </p>

            </div>

            {/* STATS */}

            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">

              {[
                {
                  label:
                    "Followers",
                  value:
                    result.followersCount,
                  description:
                    "persoane te urmăresc",
                  icon: "👥",
                  accent:
                    "blue",
                },
                {
                  label:
                    "Following",
                  value:
                    result.followingCount,
                  description:
                    "persoane urmărești",
                  icon: "➡️",
                  accent:
                    "purple",
                },
                {
                  label:
                    "Nu te urmăresc",
                  value:
                    result.notFollowingBack
                      .length,
                  description:
                    "nu te urmăresc înapoi",
                  icon: "💔",
                  accent:
                    "pink",
                },
              ].map(
                (card) => (
                  <div
                    key={
                      card.label
                    }
                    className={`group rounded-3xl border p-5 transition duration-300 hover:-translate-y-1 sm:p-6 ${
                      card.accent ===
                      "pink"
                        ? "border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:border-pink-500/40"
                        : ""
                    }`}
                    style={
                      card.accent !==
                      "pink"
                        ? {
                            backgroundColor:
                              colors.card,
                            borderColor:
                              colors.border,
                          }
                        : undefined
                    }
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{
                            color:
                              colors.muted,
                          }}
                        >
                          {
                            card.label
                          }
                        </p>

                        <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                          {
                            card.value
                          }
                        </p>

                        <p
                          className="mt-2 text-sm"
                          style={{
                            color:
                              colors.subtle,
                          }}
                        >
                          {
                            card.description
                          }
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-xl transition duration-300 group-hover:scale-110">
                        {
                          card.icon
                        }
                      </div>

                    </div>
                  </div>
                )
              )}

            </div>

            {/* CHARTS */}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">

              <div
                className="rounded-3xl border p-5 sm:p-6"
                style={{
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                }}
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold">
                      Follow-back
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color:
                          colors.subtle,
                      }}
                    >
                      Din persoanele pe care le
                      urmărești
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    {followingBackPercentage}%
                  </span>

                </div>

                <div className="mt-8 flex justify-center">

                  <div
                    className="relative flex h-48 w-48 items-center justify-center rounded-full transition duration-700 hover:scale-105 sm:h-56 sm:w-56"
                    style={{
                      background:
                        `conic-gradient(
                          rgb(52 211 153) 0deg,
                          rgb(52 211 153) ${
                            followingBackPercentage *
                            3.6
                          }deg,
                          rgb(236 72 153) ${
                            followingBackPercentage *
                            3.6
                          }deg,
                          rgb(236 72 153) 360deg
                        )`,
                    }}
                  >
                    <div
                      className="flex h-32 w-32 flex-col items-center justify-center rounded-full sm:h-40 sm:w-40"
                      style={{
                        backgroundColor:
                          colors.page,
                      }}
                    >
                      <span className="text-3xl font-black sm:text-4xl">
                        {
                          followingBackPercentage
                        }%
                      </span>

                      <span
                        className="mt-1 text-xs"
                        style={{
                          color:
                            colors.subtle,
                        }}
                      >
                        follow-back
                      </span>
                    </div>
                  </div>

                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-emerald-500/5 p-4 text-center">
                    <p className="text-2xl font-black text-emerald-400">
                      {
                        followingBackCount
                      }
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color:
                          colors.subtle,
                      }}
                    >
                      Te urmăresc
                    </p>
                  </div>

                  <div className="rounded-2xl bg-pink-500/5 p-4 text-center">
                    <p className="text-2xl font-black text-pink-400">
                      {
                        result
                          .notFollowingBack
                          .length
                      }
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color:
                          colors.subtle,
                      }}
                    >
                      Nu te urmăresc
                    </p>
                  </div>

                </div>

              </div>

              <div
                className="rounded-3xl border p-5 sm:p-6"
                style={{
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                }}
              >

                <p className="text-sm font-semibold">
                  Comunitatea ta
                </p>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color:
                      colors.subtle,
                  }}
                >
                  Followers vs Following
                </p>

                <div className="mt-8 space-y-7">

                  {[
                    {
                      name:
                        "Followers",
                      value:
                        result.followersCount,
                      icon: "👥",
                      color:
                        "rgb(59 130 246)",
                    },
                    {
                      name:
                        "Following",
                      value:
                        result.followingCount,
                      icon: "➡️",
                      color:
                        "rgb(168 85 247)",
                    },
                  ].map(
                    (item) => (
                      <div
                        key={
                          item.name
                        }
                      >

                        <div className="mb-2 flex items-end justify-between">

                          <div>
                            <p className="text-sm font-bold">
                              {
                                item.icon
                              }{" "}
                              {
                                item.name
                              }
                            </p>

                            <p
                              className="text-xs"
                              style={{
                                color:
                                  colors.subtle,
                              }}
                            >
                              {item.name ===
                              "Followers"
                                ? "Persoane care te urmăresc"
                                : "Persoane pe care le urmărești"}
                            </p>
                          </div>

                          <span className="text-2xl font-black">
                            {
                              item.value
                            }
                          </span>

                        </div>

                        <div className="h-4 overflow-hidden rounded-full bg-black/10 dark:bg-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width:
                                Math.min(
                                  100,
                                  (item.value /
                                    Math.max(
                                      result.followersCount,
                                      result.followingCount
                                    )) *
                                    100
                                ) + "%",
                              backgroundColor:
                                item.color,
                            }}
                          />
                        </div>

                      </div>
                    )
                  )}

                </div>

                <div
                  className="mt-10 rounded-2xl border p-5"
                  style={{
                    borderColor:
                      colors.border,
                    backgroundColor:
                      darkMode
                        ? "rgba(0,0,0,0.15)"
                        : "rgba(0,0,0,0.025)",
                  }}
                >

                  <div className="flex justify-between">

                    <div>
                      <p
                        className="text-xs"
                        style={{
                          color:
                            colors.subtle,
                        }}
                      >
                        Diferență
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        {Math.abs(
                          result.followersCount -
                            result.followingCount
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="text-xs"
                        style={{
                          color:
                            colors.subtle,
                        }}
                      >
                        Raport
                      </p>

                      <p className="mt-1 text-2xl font-black text-purple-400">
                        {result.followingCount >
                        0
                          ? (
                              result.followersCount /
                              result.followingCount
                            ).toFixed(
                              2
                            )
                          : "0.00"}
                        x
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* FILTERS */}

            <div
              className="mt-4 rounded-3xl border p-2"
              style={{
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              }}
            >

              <div className="grid gap-2 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    selectFilter(
                      "notFollowingBack"
                    )
                  }
                  className={`rounded-2xl p-4 text-left transition duration-300 ${
                    filter ===
                    "notFollowingBack"
                      ? "bg-pink-500/10 ring-1 ring-pink-500/30"
                      : "hover:bg-black/5 dark:hover:bg-white/[0.03]"
                  }`}
                >

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-sm font-bold">
                        💔 Nu te urmăresc
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color:
                            colors.subtle,
                        }}
                      >
                        Îi urmărești, dar ei nu te
                        urmăresc
                      </p>
                    </div>

                    <span className="rounded-xl bg-pink-500/10 px-3 py-1.5 text-sm font-black text-pink-400">
                      {
                        result
                          .notFollowingBack
                          .length
                      }
                    </span>

                  </div>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectFilter(
                      "notFollowedByYou"
                    )
                  }
                  className={`rounded-2xl p-4 text-left transition duration-300 ${
                    filter ===
                    "notFollowedByYou"
                      ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                      : "hover:bg-black/5 dark:hover:bg-white/[0.03]"
                  }`}
                >

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-sm font-bold">
                        💚 Te urmăresc
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color:
                            colors.subtle,
                        }}
                      >
                        Ei te urmăresc, dar tu nu îi
                        urmărești
                      </p>
                    </div>

                    <span className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-sm font-black text-emerald-400">
                      {
                        result
                          .notFollowedByYou
                          .length
                      }
                    </span>

                  </div>

                </button>

              </div>

            </div>

            {/* LIST */}

            <div
              className="mt-4 overflow-hidden rounded-3xl border"
              style={{
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              }}
            >

              <div
                className="border-b p-5 sm:p-6"
                style={{
                  borderColor:
                    colors.border,
                }}
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <h3 className="text-xl font-bold">
                      {listTitle}
                    </h3>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color:
                          colors.subtle,
                      }}
                    >
                      {
                        listDescription
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      exportFullReport
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.98] sm:w-auto"
                  >
                    📑 Descarcă raport
                  </button>

                </div>

                <div className="mt-4 flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={exportTxt}
                    className="rounded-xl border px-4 py-3 text-sm font-bold transition hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      borderColor:
                        colors.border,
                    }}
                  >
                    📄 TXT
                  </button>

                  <button
                    type="button"
                    onClick={exportCsv}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                  >
                    📊 CSV
                  </button>

                  <button
                    type="button"
                    onClick={copyList}
                    className="rounded-xl border px-4 py-3 text-sm font-bold transition hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      borderColor:
                        colors.border,
                    }}
                  >
                    📋 Copiază
                  </button>

                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <div className="relative flex-1">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      🔎
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(
                        event
                      ) =>
                        setSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Caută username..."
                      className="w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-pink-500/50"
                      style={{
                        borderColor:
                          colors.border,
                        backgroundColor:
                          darkMode
                            ? "rgba(0,0,0,0.2)"
                            : "rgba(0,0,0,0.025)",
                        color:
                          colors.text,
                      }}
                    />

                  </div>

                  <select
                    value={sortOrder}
                    onChange={(
                      event
                    ) =>
                      setSortOrder(
                        event.target
                          .value as SortOrder
                      )
                    }
                    className="rounded-xl border px-4 py-3.5 text-sm font-semibold outline-none"
                    style={{
                      borderColor:
                        colors.border,
                      backgroundColor:
                        darkMode
                          ? "#111113"
                          : "#ffffff",
                      color:
                        colors.text,
                    }}
                  >
                    <option value="asc">
                      A–Z
                    </option>

                    <option value="desc">
                      Z–A
                    </option>
                  </select>

                </div>

                <p
                  className="mt-3 text-xs"
                  style={{
                    color:
                      colors.subtle,
                  }}
                >
                  {search
                    ? `${filteredUsers.length} rezultate pentru „${search}”`
                    : `${filteredUsers.length} conturi • ${
                        sortOrder ===
                        "asc"
                          ? "A–Z"
                          : "Z–A"
                      }`}
                </p>

              </div>

              <div className="max-h-[600px] overflow-y-auto">

                {filteredUsers.length ===
                0 ? (

                  <div className="p-10 text-center">

                    <div className="text-4xl">
                      🔍
                    </div>

                    <p className="mt-3 font-semibold">
                      Nu am găsit rezultate
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color:
                          colors.subtle,
                      }}
                    >
                      Încearcă un alt username.
                    </p>

                  </div>

                ) : (

                  filteredUsers.map(
                    (
                      username,
                      index
                    ) => (

                      <div
                        key={username}
                        className="group flex items-center justify-between border-b px-4 py-4 transition duration-200 last:border-0 hover:bg-black/[0.025] dark:hover:bg-white/[0.03] sm:px-6"
                        style={{
                          borderColor:
                            colors.border,
                        }}
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition group-hover:scale-110 ${
                              filter ===
                              "notFollowedByYou"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-pink-500/10 text-pink-400"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold">
                              @{username}
                            </p>

                            <p
                              className="text-xs"
                              style={{
                                color:
                                  colors.subtle,
                              }}
                            >
                              {filter ===
                              "notFollowedByYou"
                                ? "Te urmărește"
                                : "Nu te urmărește"}
                            </p>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openInstagram(
                              username
                            )
                          }
                          className="ml-3 shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-black/5 dark:hover:bg-white/5"
                          style={{
                            borderColor:
                              colors.border,
                          }}
                        >
                          <span className="hidden sm:inline">
                            Vezi profil ↗
                          </span>

                          <span className="sm:hidden">
                            ↗
                          </span>
                        </button>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </section>
        )}

        {/* FOOTER */}

        <footer className="mt-10 pb-6 text-center">

          <div className="mx-auto mb-3 h-px max-w-xs bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

          <p
            className="text-xs"
            style={{
              color:
                colors.subtle,
            }}
          >
            FollowCheck
            <span className="mx-2">
              •
            </span>
            Instagram analytics
            <span className="mx-2">
              •
            </span>
            v1.0
          </p>

        </footer>

      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }

          50% {
            transform: translateX(100%);
          }

          100% {
            transform: translateX(250%);
          }
        }
      `}</style>

    </main>
  );
}