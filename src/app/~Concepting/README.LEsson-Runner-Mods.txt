I need to do a rennovation of the Lesson Runner into a version 2. 
* copy the toolbar-lesson-builder-v2 toolbar into a new component called Toolbar-Lesson-runner-V2. 
* Instead of reading selectedContextLessonBuilderLesson it should read changes to selectedContextLessonRunnerLesson
* The tour state of selectedContextLessonBuilderLesson and selectedContextLessonRunnerLesson should be tracked separately.
* Remove the drag drop functionality from the lesson-runner-v2.
* Replace the "remove" X icon with a square (an uneditable) checkbox. When the the node is completed and we move onto the next, it should get a green checkmark to show we've visited it.
* Remove the unapplied changes functionality from lesson-runner v2.
* Remove the "Apply" and "Clear" action buttons. Keep "Play" and "Autopilot". 
* Both "Play" and "Autopoilot" on toolbar-lesson-BUILDER-v2 control should apply to the Toolbar-Lesson-BUILDER-V2 tour state, similar to how the "Play" and "Autopilot" applied to the original Lesson Runner.

* Both "Play" and "Autopoilot" on toolbar-lesson-RUNNER-v2 control should apply to the Toolbar-Lesson-RUNNER-V2 tour state, similar to how the "Play" and "Autopilot" applied to the original Lesson Runner.