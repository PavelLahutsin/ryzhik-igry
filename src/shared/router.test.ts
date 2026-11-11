import { describe, expect, it } from "vitest";
import { gameHref, gameOf, href, subSegments } from "./router";

describe("shell router", () => {
  it("finds the game id", () => {
    expect(gameOf("")).toBeNull();
    expect(gameOf("#/")).toBeNull();
    expect(gameOf("#/mozaika/play/2")).toBe("mozaika");
  });
  it("gives a game its own sub path", () => {
    expect(subSegments("#/mozaika/play/2", "mozaika")).toEqual(["play", "2"]);
    expect(subSegments("#/teni", "mozaika")).toEqual([]);
  });
  it("builds hashes", () => {
    expect(href("/")).toBe("#/");
    expect(gameHref("sliyanie", "/")).toBe("#/sliyanie/");
    expect(gameHref("sliyanie", "/play/1")).toBe("#/sliyanie/play/1");
  });
});
