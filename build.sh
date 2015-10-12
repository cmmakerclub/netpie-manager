rm -rvf dist
gulp build
git add . 
git commit -m "Rebuild"
git push  -u origin master 
pushd ..
git commit -am "rebuild"
git push  -u origin master 
popd
