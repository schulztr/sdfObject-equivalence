# sdfObject-equivalence

This tool tries to determine equivalence between two sdfObjects and is still work in progress.

## Equivalence

| SDF quality                                                  | Equivalence                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| sdfObject                                                    | if all *properties*, *actions*, *events* and *common qualities* are equal |
| sdfProperty                                                  | if all *common qualities* and *data qualities* are equal     |
| sdfAction                                                    | if *sdfInputData*, *sdfOutputData* and *common qualities* are equal |
| sdfEvent                                                     | if *sdfOutputData* and *common qualities* are equal          |
| sdfInputData, sdfOutputData                                  | if all *common qualities* and *data qualities* are equal     |
| **common qualities**                                         |                                                              |
| description                                                  | ignore                                                       |
| label                                                        | ignore                                                       |
| $comment                                                     | ignore                                                       |
| sdfRef                                                       | - for copying sdfData definitions within the same sdf file: equality of the resulting object after resolving and merging like described in [section 4.4](https://datatracker.ietf.org/doc/html/draft-ietf-asdf-sdf-07#section-4.4)<br /> - else: same (resolved) namespace and fragment |
| sdfRequired                                                  | if all sdfRefs are equal (regardless of order)               |
| **data qualities**                                           |                                                              |
| type                                                         | if corresponding string is equal                             |
| const, default, minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, minLength, maxLength, minItems, maxItems, uniqueItems | if value is equal                                            |
| pattern                                                      | if corresponding string is equal                             |
| format                                                       | if corresponding string is equal                             |
| required                                                     | if every item is equal regardless of order                   |
| properties                                                   | if every key-value-pair is equal regardless of order         |
| unit                                                         | if corresponding string is equal                             |
| readable, writable, observable, nullable                     | if value is equal                                            |
| contentFormat                                                | if corresponding string is equal                             |
| sdfChoice                                                    | if every key-value-pair is equal regardless of order         |
| enum                                                         | if corresponding sdfChoice is equal                          |
| **sdfType**                                                  |                                                              |
| byt-string                                                   | if corresponding string is equal                             |
| unix-time                                                    | if corresponding number is equal                             |

### Class Name Equivalence

- compare as lowercase string without `-`, `.` or `_`


