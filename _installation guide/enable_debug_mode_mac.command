#!/bin/bash
for v in 6 7 8 9 10 11 12; do defaults write com.adobe.CSXS.$v PlayerDebugMode 1; done
echo "Done. Restart Premiere Pro."
