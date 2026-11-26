/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  if (typeof HTMLMediaElement !== "undefined") {
    HTMLMediaElement.prototype.play = function play() {
      return Promise.resolve();
    };
  }
});

import { confirmLeave } from "./ui";

describe("confirmLeave", () => {
  beforeEach(() => {
    const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
      showModal?: () => void;
      close?: () => void;
    };
    if (typeof proto.showModal !== "function") {
      proto.showModal = function showModal() {
        this.setAttribute("open", "");
      };
    }
    if (typeof proto.close !== "function") {
      proto.close = function close() {
        this.removeAttribute("open");
      };
    }
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it("opens one dialog and «Играть дальше» stays in the game", () => {
    const onLeave = vi.fn();
    const back = document.createElement("button");
    back.className = "btn--back";
    document.body.append(back);
    back.focus();

    confirmLeave(onLeave);
    confirmLeave(onLeave);

    expect(document.querySelectorAll("dialog.leave")).toHaveLength(1);
    const stay = document.querySelector<HTMLButtonElement>("dialog.leave .btn--play")!;
    expect(stay.textContent).toBe("Играть дальше");
    expect(document.activeElement).toBe(stay);

    stay.click();

    expect(onLeave).not.toHaveBeenCalled();
    expect(document.querySelector("dialog.leave")).toBeNull();
    expect(document.activeElement).toBe(back);
  });

  it("«В домик» calls the original handler once", () => {
    const onLeave = vi.fn();
    const other = vi.fn();
    confirmLeave(onLeave);
    confirmLeave(other);

    const leave = document.querySelector<HTMLButtonElement>("dialog.leave .btn--ghost")!;
    expect(leave.textContent).toBe("В домик");
    leave.click();
    leave.click();

    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(other).not.toHaveBeenCalled();
    expect(document.querySelector("dialog.leave")).toBeNull();
  });
});
