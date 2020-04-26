#!/bin/sh

source env/bin/activate

jupyter nbconvert --to notebook --inplace --execute covid19.ipynb
jupyter nbconvert --to notebook --inplace --execute covid19-lombardia.ipynb
git commit -am "Update"
git push
