# Miami University Enrollment Checker

A [Deno script](https://deno.land/) to check the enrollment status of courses at Miami University.

## Quick Run
```
deno run --allow-net https://github.com/LukasMurdock/miami-university-enrollment-checker/raw/main/enrollmentCheck.ts -t 'Fall 2022-23' 'CSE 252'
```

## Installation
First, [install Deno](https://deno.land/).

That’s it.

## Usage
You have two options:
1. Clone repo, set parameters in-file
2. Cache repo, set parameters in command-line

Deno enables you to cache and run remote code. You can run this script simply with:
```
deno run https://github.com/LukasMurdock/miami-university-enrollment-checker/raw/main/enrollmentCheck.ts
```

The first time you run this command, Deno will fetch and cache the code, and never update it until the code is run with the --reload flag. This is a [key behavior of Deno](https://deno.land/manual#:~:text=Fetch%20and%20cache%20remote%20code%20upon%20first%20execution%2C%20and%20never%20update%20it%20until%20the%20code%20is%20run%20with%20the%20%2D%2Dreload%20flag.%20(So%2C%20this%20will%20still%20work%20on%20an%20airplane.)).

This scripts requires term and course parameters to be set either in-file or by passing them in parameters.

### Configure Term in Command-Line
To configure a term with command-line parameters, you can pass the term in with the `-t` flag and a string formatted as `'Fall 2022-23'` in the format of `Season StartYear-EndYear`.
```
deno run https://github.com/LukasMurdock/miami-university-enrollment-checker/raw/main/enrollmentCheck.ts -t 'Fall 2022-23'
```

### Configure Courses in Command-Line
To configure courses, you simply add them as strings to the end of the command, `'CSE 252' 'CSE 271'` as `'SubjectCode CourseCode`.
```
deno run https://github.com/LukasMurdock/miami-university-enrollment-checker/raw/main/enrollmentCheck.ts -t 'Fall 2022-23' 'CSE 252' 'CSE 271'
```

### Allow net access
Deno is secure by default. Unless you specifically enable it, a program run with Deno has no file, network, or environment access. You will be prompted to access "ws.miamioh.edu" every time you run the script unless you grant it permission beforehand by passing in `--allow-net`.

```
deno run --allow-net https://github.com/LukasMurdock/miami-university-enrollment-checker/raw/main/enrollmentCheck.ts -t 'Fall 2022-23' 'CSE 252' 'CSE 271'
```
