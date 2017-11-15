# Opioid Crisis (Story)

Description: 
> A story based visualization that focuses on raising awareness of the opioid crisis in the United States.

#### Story Basis and Examples
- [Chris's article: We can’t cure the opioid epidemic if it’s not treated as a health crisis](http://thehill.com/blogs/pundits-blog/healthcare/339914-we-cant-cure-the-opioid-epidemic-if-its-not-treated-as-a-health-crisis)
- [Bill Heisel’s Article: Free Your Mind: Solving drug epidemic calls for crisis mentality](https://www.centerforhealthjournalism.org/2017/08/15/free-your-mind-solving-drug-epidemic-calls-crisis-mentality)
- [How well-intentioned doctors helped create the opioid epidemic](https://www.vox.com/2017/11/7/16387318/doctors-helped-create-opioid-epidemic)
- [More people are dying from opioid overdoses in these four states than in the rest of the US](http://www.businessinsider.com/opioid-crisis-death-rates-four-states-us-average-trump-2017-10)
- [How the Epidemic of Drug Overdose Deaths Rippled Across America](https://www.nytimes.com/interactive/2016/01/07/us/drug-overdose-deaths-in-the-us.html)
- [You Draw It: Just How Bad Is the Drug Overdose Epidemic?](https://www.nytimes.com/interactive/2017/04/14/upshot/drug-overdose-epidemic-you-draw-it.html)
- [Drug Deaths in America Are Rising Faster Than Ever](https://www.nytimes.com/interactive/2017/06/05/upshot/opioid-epidemic-drug-overdose-deaths-are-rising-faster-than-ever.html)

### Development Strategy

#### Branch Nomenclature
1.) Feature/Bug Branch Naming

The general rule for branch naming is:
```
type/opioid-story-ticketnumber-description-of-issue-seperated-by-dashes
```
 * "type" - what kind of issue type the work is: **bug** or **feature**. 
 * "opiod-story-ticketnumber" - full name-number of the ticket that Jira assigned it.
 * "description-of-issue-seperated-by-dashes" - a short human readable description of the task.

Example:

   If the type of Jira Ticket is a **feature** called *FGH-666 Update README to Reflect new Development Strategy*
   
   Then the naming for your new branch to work on that feature should be
   ```
   feature/opioid-story-666-update-readme
   ```

2.) Release Branch Naming
The general rule for branch naming is:
```
rel-month-day-year
```
 * "rel" - constant 
 * "month" - Three letter month name, lowercase, **not numbers**
 * "day" - Number (do *not* include beginning "0" for days with only one integar)
 * "year" - full number
 
 Example:
 
   If the date of a new release is October 2nd 1990.
   
   Then the naming for your new branch to work on that feature should be:
    
    ```
    rel-oct-2-1990
    ```

#### How to Delete Old Branches

##### Why?
>We delete old feature and release branches when their content has been merged into master or when the release branch has been replaced.

##### How?
> * First delete the local version of the branch
```
git branch -d branch-name
```
> * Then delete the bitbucket (remote) version of the branch. *Go to branches page, then Actions -> Delete*
> * Check your local repository for the remote branches. You will notice that the remote version is still present on your local machine.
```
git branch -a
```
> * "Prune" or sync up your local deletions with your bitbucket branches
```
git remote prune origin
```
> * You should now have gotten rid of the old branches entirely
