// todo: maybe some of these should be RecordOptions, at the Record level.
// todo: fuzzy: planning on displaying negative inputs as "fuzzy". Eg -7 is displayed as ~7. Allows to keep data as numeric. But is it kinda hacky?

/*
todo: 

failed / warmup are Effort values? Make effort a select instead of number? Expected values are actually limited to about 5-10 in .5 steps. Plus F and W for failed / warmup.
Making a Select addresses issues with adding F and W to numeric input (would otherwise have to change to string with restricted values, and mobile keyboard will have to choose between qwerty or numeric keyboard)
Could also possibly use the mui Rating component 5 stars in .5 steps, plus warmup/fail stars (but those should be whole only). That's kind of a space hog though. Maybe a dialog to select the value.
Alternatively, can use the rest of the rpe scale for them. Warmups are 0-5 or so, failures are 11. Maybe make the range for what counts as warmups user defined (eg, 0-3, 0-5) with minimum of just 0.
And for failure it can be anything > 10 (or < 0 for rir). I guess you can rate the degree of failure. Eg, a slow grinder that you just barely fail vs not being able to control even the eccentric. Let the user decide their own scale?



Allow modifiers to be added as "equipment" that will add to total weight. So modifiers can store a "weight" property. Then bodyweight modifier can be treated as "equipment" and add to the total weight.
Sum all modifiers with equipment weight plus "added weight" (plate weight) to get total weight. If none, there is only total weight. The display fields will also have to watch modifiers and
switch from just a "weight" column to added/total weight columns. 


*/

export interface Set {
  /** kilograms */
  weight?: number
  /** meters */
  distance?: number
  /** seconds */
  time?: number
  /** whole number */
  reps?: number
  /** RPE (0-10 in .5 steps) */
  effort?: number
}
