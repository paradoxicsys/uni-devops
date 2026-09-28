# Git Assignment

All commands were run in a local practice repository (`git-practice`) created only for this assignment.

---

## Task 1 – `git commit -m` vs `git commit -a -m`

### Difference

| | `git commit -m "msg"` | `git commit -a -m "msg"` |
|---|---|---|
| What gets committed | **Only what is already in the staging area** (added with `git add`) | Automatically stages **all modified and deleted tracked files**, then commits |
| Needs `git add` first? | Yes – otherwise Git says `no changes added to commit` | No, for files Git already tracks |
| Modified tracked files | Committed only if staged | Committed automatically |
| Deleted tracked files | Committed only if staged (`git rm` / `git add`) | Committed automatically |
| **New (untracked) files** | Committed only if staged | **Never included** – still need `git add` |
| Control | Full control – you choose exactly what goes into the commit | Convenient shortcut, but commits every tracked change |

`-a` = `--all`. In short: `git commit -a -m` = `git add -u` (update tracked files) + `git commit -m`.

### Step 1 – Create the repository and the first commit

![setup](screenshots/01-setup.png)

```bash
$ git init -q -b main && git branch --show-current
main
$ echo "App version 1" > app.txt
$ echo "Config v1" > config.txt
$ git add app.txt config.txt
$ git commit -m "Initial commit: add app.txt and config.txt"
[main (root-commit) e49ff5c] Initial commit: add app.txt and config.txt
 2 files changed, 2 insertions(+)
 create mode 100644 app.txt
 create mode 100644 config.txt
$ git log --oneline
e49ff5c Initial commit: add app.txt and config.txt
$ git status
On branch main
nothing to commit, working tree clean
```

### Step 2 – `git commit -m` with nothing staged → "no changes added to commit"

A tracked file (`app.txt`) is modified and a new untracked file (`notes.txt`) is created, but nothing is staged.

![commit -m without add](screenshots/02-commit-m-without-add.png)

```bash
$ echo "App version 2" >> app.txt
$ echo "new notes" > notes.txt
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   app.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

no changes added to commit (use "git add" and/or "git commit -a")

$ git commit -m "Try commit without staging"
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   app.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

no changes added to commit (use "git add" and/or "git commit -a")

$ git log --oneline
e49ff5c Initial commit: add app.txt and config.txt
```

No commit was created – plain `-m` only commits the staging area, and it was empty.

### Step 3 – `git add` + `git commit -m` → only the staged file is committed

![commit -m with add](screenshots/03-commit-m-with-add.png)

```bash
$ git add app.txt
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   app.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

$ git commit -m "Update app.txt to version 2 (staged with git add)"
[main b53a789] Update app.txt to version 2 (staged with git add)
 1 file changed, 1 insertion(+)

$ git status
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

nothing added to commit but untracked files present (use "git add" to track)

$ git log --oneline
b53a789 Update app.txt to version 2 (staged with git add)
e49ff5c Initial commit: add app.txt and config.txt
```

### Step 4 – `git commit -a -m` → modified + deleted tracked files committed, untracked file NOT

`app.txt` is modified again and the tracked file `config.txt` is deleted. Nothing is staged with `git add`.

![commit -a -m](screenshots/04-commit-a-m.png)

```bash
$ echo "App version 3" >> app.txt
$ rm config.txt
$ git status
On branch main
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   app.txt
	deleted:    config.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

no changes added to commit (use "git add" and/or "git commit -a")

$ git commit -a -m "Update app.txt to v3 and delete config.txt using -a"
[main a73ea3a] Update app.txt to v3 and delete config.txt using -a
 2 files changed, 1 insertion(+), 1 deletion(-)
 delete mode 100644 config.txt

$ git status
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

nothing added to commit but untracked files present (use "git add" to track)

$ git log --oneline --stat -1
a73ea3a Update app.txt to v3 and delete config.txt using -a
 app.txt    | 1 +
 config.txt | 1 -
 2 files changed, 1 insertion(+), 1 deletion(-)
```

`-a` staged the **modification** of `app.txt` and the **deletion** of `config.txt` automatically, but `notes.txt` is still untracked.

### Step 5 – New files always need `git add`

![add untracked](screenshots/05-add-untracked.png)

```bash
$ git add notes.txt
$ git commit -m "Add notes.txt (new file needs git add)"
[main 847a846] Add notes.txt (new file needs git add)
 1 file changed, 1 insertion(+)
 create mode 100644 notes.txt
$ git status
On branch main
nothing to commit, working tree clean
$ git log --oneline
847a846 Add notes.txt (new file needs git add)
a73ea3a Update app.txt to v3 and delete config.txt using -a
b53a789 Update app.txt to version 2 (staged with git add)
e49ff5c Initial commit: add app.txt and config.txt
```

---

## Task 2 – `git cherry-pick`

`git cherry-pick <commit>` takes the changes introduced by **one specific commit** from another branch and applies them as a **new commit** on the current branch (new hash, same changes and message). Typical use: bring a hotfix from a feature branch into `main` without merging the whole branch.

### Step 1 – Commits on `main` and create a branch

![main log](screenshots/06-main-log.png)

```bash
$ git branch --show-current
main
$ git log --oneline
847a846 Add notes.txt (new file needs git add)
a73ea3a Update app.txt to v3 and delete config.txt using -a
b53a789 Update app.txt to version 2 (staged with git add)
e49ff5c Initial commit: add app.txt and config.txt
$ git switch -c feature
Switched to a new branch 'feature'
$ git branch
* feature
  main
```

### Step 2 – Make 3 commits on `feature` and identify the commit to pick

![feature commits](screenshots/07-feature-commits.png)

```bash
$ echo "login page" > login.txt && git add login.txt && git commit -m "Add login page"
[feature 9ac92b2] Add login page
 1 file changed, 1 insertion(+)
 create mode 100644 login.txt

$ echo "timeout=30" > hotfix.txt && git add hotfix.txt && git commit -m "Hotfix: set request timeout to 30s"
[feature 773db3b] Hotfix: set request timeout to 30s
 1 file changed, 1 insertion(+)
 create mode 100644 hotfix.txt

$ echo "dashboard page" > dashboard.txt && git add dashboard.txt && git commit -m "Add dashboard page"
[feature 971a19e] Add dashboard page
 1 file changed, 1 insertion(+)
 create mode 100644 dashboard.txt

$ git log --oneline
971a19e Add dashboard page
773db3b Hotfix: set request timeout to 30s
9ac92b2 Add login page
847a846 Add notes.txt (new file needs git add)
a73ea3a Update app.txt to v3 and delete config.txt using -a
b53a789 Update app.txt to version 2 (staged with git add)
e49ff5c Initial commit: add app.txt and config.txt

$ git log --oneline main..feature          # commits on feature that are not on main
971a19e Add dashboard page
773db3b Hotfix: set request timeout to 30s
9ac92b2 Add login page

$ git log --oneline --grep=Hotfix          # find the commit by message
773db3b Hotfix: set request timeout to 30s
```

The commit to cherry-pick is **`773db3b` – "Hotfix: set request timeout to 30s"**.

### Step 3 – Cherry-pick the commit onto `main`

![cherry-pick](screenshots/08-cherry-pick.png)

```bash
$ git show --stat --format="%h %s%n%an  %ad" 773db3b
773db3b Hotfix: set request timeout to 30s
Shambhu  Mon Sep 28 19:02:30 2026 +0530

 hotfix.txt | 1 +
 1 file changed, 1 insertion(+)

$ git switch main
Switched to branch 'main'
$ ls
app.txt
notes.txt

$ git cherry-pick 773db3b
[main 42d8559] Hotfix: set request timeout to 30s
 Date: Mon Sep 28 19:02:30 2026 +0530
 1 file changed, 1 insertion(+)
 create mode 100644 hotfix.txt

$ git log --oneline
42d8559 Hotfix: set request timeout to 30s
847a846 Add notes.txt (new file needs git add)
a73ea3a Update app.txt to v3 and delete config.txt using -a
b53a789 Update app.txt to version 2 (staged with git add)
e49ff5c Initial commit: add app.txt and config.txt
```

### Step 4 – Verify

![verify](screenshots/09-verify.png)

```bash
$ ls
app.txt
hotfix.txt
notes.txt

$ cat hotfix.txt
timeout=30

$ git show --stat --oneline HEAD
42d8559 Hotfix: set request timeout to 30s
 hotfix.txt | 1 +
 1 file changed, 1 insertion(+)

$ ls login.txt dashboard.txt                 # other feature commits are NOT on main
ls: dashboard.txt: No such file or directory
ls: login.txt: No such file or directory

$ git log --oneline main..feature
971a19e Add dashboard page
773db3b Hotfix: set request timeout to 30s
9ac92b2 Add login page

$ git cherry -v main feature                 # "-" = an equivalent change already exists on main
+ 9ac92b2eab7e1f96739b30f8e29837d6250b8a96 Add login page
- 773db3bac3a3ea3ab86ed067f5ca5e412269132d Hotfix: set request timeout to 30s
+ 971a19ec9aef1245b42ff619b7c16cb00e2e20b0 Add dashboard page

$ git log --oneline --graph --all
* 42d8559 Hotfix: set request timeout to 30s
| * 971a19e Add dashboard page
| * 773db3b Hotfix: set request timeout to 30s
| * 9ac92b2 Add login page
|/
* 847a846 Add notes.txt (new file needs git add)
* a73ea3a Update app.txt to v3 and delete config.txt using -a
* b53a789 Update app.txt to version 2 (staged with git add)
* e49ff5c Initial commit: add app.txt and config.txt
```

### Result

- The hotfix change (`hotfix.txt` with `timeout=30`) is now on `main` as a **new commit `42d8559`** – same message, author and date as `773db3b`, but a different hash because its parent is different.
- `Add login page` (`9ac92b2`) and `Add dashboard page` (`971a19e`) were **not** brought to `main` (`login.txt` and `dashboard.txt` do not exist there).
- `git cherry` marks the hotfix with `-` (already applied to `main`) and the other two with `+` (not on `main`).

Useful options: `git cherry-pick A B` (several commits), `git cherry-pick A^..C` (range), `-n` (apply without committing), `-x` (add "cherry picked from commit …" to the message), and on a conflict: fix files → `git add` → `git cherry-pick --continue` (or `--abort`).
