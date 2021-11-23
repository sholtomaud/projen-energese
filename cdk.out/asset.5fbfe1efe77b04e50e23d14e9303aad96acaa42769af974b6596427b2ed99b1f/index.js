"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// eslint-disable-next-line import/no-extraneous-dependencies
const aws_sdk_1 = require("aws-sdk");
const AUTO_DELETE_OBJECTS_TAG = 'aws-cdk:auto-delete-objects';
const s3 = new aws_sdk_1.S3();
async function handler(event) {
    var _a;
    switch (event.RequestType) {
        case 'Create':
            return;
        case 'Update':
            return onUpdate(event);
        case 'Delete':
            return onDelete((_a = event.ResourceProperties) === null || _a === void 0 ? void 0 : _a.BucketName);
    }
}
exports.handler = handler;
async function onUpdate(event) {
    var _a, _b;
    const updateEvent = event;
    const oldBucketName = (_a = updateEvent.OldResourceProperties) === null || _a === void 0 ? void 0 : _a.BucketName;
    const newBucketName = (_b = updateEvent.ResourceProperties) === null || _b === void 0 ? void 0 : _b.BucketName;
    const bucketNameHasChanged = newBucketName != null && oldBucketName != null && newBucketName !== oldBucketName;
    /* If the name of the bucket has changed, CloudFormation will try to delete the bucket
       and create a new one with the new name. So we have to delete the contents of the
       bucket so that this operation does not fail. */
    if (bucketNameHasChanged) {
        return onDelete(oldBucketName);
    }
}
/**
 * Recursively delete all items in the bucket
 *
 * @param bucketName the bucket name
 */
async function emptyBucket(bucketName) {
    var _a, _b;
    const listedObjects = await s3.listObjectVersions({ Bucket: bucketName }).promise();
    const contents = [...(_a = listedObjects.Versions) !== null && _a !== void 0 ? _a : [], ...(_b = listedObjects.DeleteMarkers) !== null && _b !== void 0 ? _b : []];
    if (contents.length === 0) {
        return;
    }
    const records = contents.map((record) => ({ Key: record.Key, VersionId: record.VersionId }));
    await s3.deleteObjects({ Bucket: bucketName, Delete: { Objects: records } }).promise();
    if (listedObjects === null || listedObjects === void 0 ? void 0 : listedObjects.IsTruncated) {
        await emptyBucket(bucketName);
    }
}
async function onDelete(bucketName) {
    if (!bucketName) {
        throw new Error('No BucketName was provided.');
    }
    if (!await isBucketTaggedForDeletion(bucketName)) {
        process.stdout.write(`Bucket does not have '${AUTO_DELETE_OBJECTS_TAG}' tag, skipping cleaning.\n`);
        return;
    }
    try {
        await emptyBucket(bucketName);
    }
    catch (e) {
        if (e.code !== 'NoSuchBucket') {
            throw e;
        }
        // Bucket doesn't exist. Ignoring
    }
}
/**
 * The bucket will only be tagged for deletion if it's being deleted in the same
 * deployment as this Custom Resource.
 *
 * If the Custom Resource is every deleted before the bucket, it must be because
 * `autoDeleteObjects` has been switched to false, in which case the tag would have
 * been removed before we get to this Delete event.
 */
async function isBucketTaggedForDeletion(bucketName) {
    const response = await s3.getBucketTagging({ Bucket: bucketName }).promise();
    return response.TagSet.some(tag => tag.Key === AUTO_DELETE_OBJECTS_TAG && tag.Value === 'true');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBNkQ7QUFDN0QscUNBQTZCO0FBQzdCLE1BQU0sdUJBQXVCLEdBQUcsNkJBQTZCLENBQUM7QUFDOUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxZQUFFLEVBQUUsQ0FBQztBQUNiLEtBQUssVUFBVSxPQUFPLENBQUMsS0FBa0Q7O0lBQzVFLFFBQVEsS0FBSyxDQUFDLFdBQVcsRUFBRTtRQUN2QixLQUFLLFFBQVE7WUFDVCxPQUFPO1FBQ1gsS0FBSyxRQUFRO1lBQ1QsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsS0FBSyxRQUFRO1lBQ1QsT0FBTyxRQUFRLE9BQUMsS0FBSyxDQUFDLGtCQUFrQiwwQ0FBRSxVQUFVLENBQUMsQ0FBQztLQUM3RDtBQUNMLENBQUM7QUFURCwwQkFTQztBQUNELEtBQUssVUFBVSxRQUFRLENBQUMsS0FBa0Q7O0lBQ3RFLE1BQU0sV0FBVyxHQUFHLEtBQTBELENBQUM7SUFDL0UsTUFBTSxhQUFhLFNBQUcsV0FBVyxDQUFDLHFCQUFxQiwwQ0FBRSxVQUFVLENBQUM7SUFDcEUsTUFBTSxhQUFhLFNBQUcsV0FBVyxDQUFDLGtCQUFrQiwwQ0FBRSxVQUFVLENBQUM7SUFDakUsTUFBTSxvQkFBb0IsR0FBRyxhQUFhLElBQUksSUFBSSxJQUFJLGFBQWEsSUFBSSxJQUFJLElBQUksYUFBYSxLQUFLLGFBQWEsQ0FBQztJQUMvRzs7c0RBRWtEO0lBQ2xELElBQUksb0JBQW9CLEVBQUU7UUFDdEIsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDbEM7QUFDTCxDQUFDO0FBQ0Q7Ozs7R0FJRztBQUNILEtBQUssVUFBVSxXQUFXLENBQUMsVUFBa0I7O0lBQ3pDLE1BQU0sYUFBYSxHQUFHLE1BQU0sRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxTQUFHLGFBQWEsQ0FBQyxRQUFRLG1DQUFJLEVBQUUsRUFBRSxTQUFHLGFBQWEsQ0FBQyxhQUFhLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pGLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdkIsT0FBTztLQUNWO0lBQ0QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xHLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN2RixJQUFJLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxXQUFXLEVBQUU7UUFDNUIsTUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDakM7QUFDTCxDQUFDO0FBQ0QsS0FBSyxVQUFVLFFBQVEsQ0FBQyxVQUFtQjtJQUN2QyxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0tBQ2xEO0lBQ0QsSUFBSSxDQUFDLE1BQU0seUJBQXlCLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDOUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLHVCQUF1Qiw2QkFBNkIsQ0FBQyxDQUFDO1FBQ3BHLE9BQU87S0FDVjtJQUNELElBQUk7UUFDQSxNQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNqQztJQUNELE9BQU8sQ0FBQyxFQUFFO1FBQ04sSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLGNBQWMsRUFBRTtZQUMzQixNQUFNLENBQUMsQ0FBQztTQUNYO1FBQ0QsaUNBQWlDO0tBQ3BDO0FBQ0wsQ0FBQztBQUNEOzs7Ozs7O0dBT0c7QUFDSCxLQUFLLFVBQVUseUJBQXlCLENBQUMsVUFBa0I7SUFDdkQsTUFBTSxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3RSxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyx1QkFBdUIsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxDQUFDO0FBQ3BHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBTMyB9IGZyb20gJ2F3cy1zZGsnO1xuY29uc3QgQVVUT19ERUxFVEVfT0JKRUNUU19UQUcgPSAnYXdzLWNkazphdXRvLWRlbGV0ZS1vYmplY3RzJztcbmNvbnN0IHMzID0gbmV3IFMzKCk7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihldmVudDogQVdTTGFtYmRhLkNsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQuUmVxdWVzdFR5cGUpIHtcbiAgICAgICAgY2FzZSAnQ3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FzZSAnVXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiBvblVwZGF0ZShldmVudCk7XG4gICAgICAgIGNhc2UgJ0RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4gb25EZWxldGUoZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzPy5CdWNrZXROYW1lKTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBvblVwZGF0ZShldmVudDogQVdTTGFtYmRhLkNsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCkge1xuICAgIGNvbnN0IHVwZGF0ZUV2ZW50ID0gZXZlbnQgYXMgQVdTTGFtYmRhLkNsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VVcGRhdGVFdmVudDtcbiAgICBjb25zdCBvbGRCdWNrZXROYW1lID0gdXBkYXRlRXZlbnQuT2xkUmVzb3VyY2VQcm9wZXJ0aWVzPy5CdWNrZXROYW1lO1xuICAgIGNvbnN0IG5ld0J1Y2tldE5hbWUgPSB1cGRhdGVFdmVudC5SZXNvdXJjZVByb3BlcnRpZXM/LkJ1Y2tldE5hbWU7XG4gICAgY29uc3QgYnVja2V0TmFtZUhhc0NoYW5nZWQgPSBuZXdCdWNrZXROYW1lICE9IG51bGwgJiYgb2xkQnVja2V0TmFtZSAhPSBudWxsICYmIG5ld0J1Y2tldE5hbWUgIT09IG9sZEJ1Y2tldE5hbWU7XG4gICAgLyogSWYgdGhlIG5hbWUgb2YgdGhlIGJ1Y2tldCBoYXMgY2hhbmdlZCwgQ2xvdWRGb3JtYXRpb24gd2lsbCB0cnkgdG8gZGVsZXRlIHRoZSBidWNrZXRcbiAgICAgICBhbmQgY3JlYXRlIGEgbmV3IG9uZSB3aXRoIHRoZSBuZXcgbmFtZS4gU28gd2UgaGF2ZSB0byBkZWxldGUgdGhlIGNvbnRlbnRzIG9mIHRoZVxuICAgICAgIGJ1Y2tldCBzbyB0aGF0IHRoaXMgb3BlcmF0aW9uIGRvZXMgbm90IGZhaWwuICovXG4gICAgaWYgKGJ1Y2tldE5hbWVIYXNDaGFuZ2VkKSB7XG4gICAgICAgIHJldHVybiBvbkRlbGV0ZShvbGRCdWNrZXROYW1lKTtcbiAgICB9XG59XG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGRlbGV0ZSBhbGwgaXRlbXMgaW4gdGhlIGJ1Y2tldFxuICpcbiAqIEBwYXJhbSBidWNrZXROYW1lIHRoZSBidWNrZXQgbmFtZVxuICovXG5hc3luYyBmdW5jdGlvbiBlbXB0eUJ1Y2tldChidWNrZXROYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaXN0ZWRPYmplY3RzID0gYXdhaXQgczMubGlzdE9iamVjdFZlcnNpb25zKHsgQnVja2V0OiBidWNrZXROYW1lIH0pLnByb21pc2UoKTtcbiAgICBjb25zdCBjb250ZW50cyA9IFsuLi5saXN0ZWRPYmplY3RzLlZlcnNpb25zID8/IFtdLCAuLi5saXN0ZWRPYmplY3RzLkRlbGV0ZU1hcmtlcnMgPz8gW11dO1xuICAgIGlmIChjb250ZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZWNvcmRzID0gY29udGVudHMubWFwKChyZWNvcmQ6IGFueSkgPT4gKHsgS2V5OiByZWNvcmQuS2V5LCBWZXJzaW9uSWQ6IHJlY29yZC5WZXJzaW9uSWQgfSkpO1xuICAgIGF3YWl0IHMzLmRlbGV0ZU9iamVjdHMoeyBCdWNrZXQ6IGJ1Y2tldE5hbWUsIERlbGV0ZTogeyBPYmplY3RzOiByZWNvcmRzIH0gfSkucHJvbWlzZSgpO1xuICAgIGlmIChsaXN0ZWRPYmplY3RzPy5Jc1RydW5jYXRlZCkge1xuICAgICAgICBhd2FpdCBlbXB0eUJ1Y2tldChidWNrZXROYW1lKTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBvbkRlbGV0ZShidWNrZXROYW1lPzogc3RyaW5nKSB7XG4gICAgaWYgKCFidWNrZXROYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gQnVja2V0TmFtZSB3YXMgcHJvdmlkZWQuJyk7XG4gICAgfVxuICAgIGlmICghYXdhaXQgaXNCdWNrZXRUYWdnZWRGb3JEZWxldGlvbihidWNrZXROYW1lKSkge1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgQnVja2V0IGRvZXMgbm90IGhhdmUgJyR7QVVUT19ERUxFVEVfT0JKRUNUU19UQUd9JyB0YWcsIHNraXBwaW5nIGNsZWFuaW5nLlxcbmApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGVtcHR5QnVja2V0KGJ1Y2tldE5hbWUpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5jb2RlICE9PSAnTm9TdWNoQnVja2V0Jykge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBCdWNrZXQgZG9lc24ndCBleGlzdC4gSWdub3JpbmdcbiAgICB9XG59XG4vKipcbiAqIFRoZSBidWNrZXQgd2lsbCBvbmx5IGJlIHRhZ2dlZCBmb3IgZGVsZXRpb24gaWYgaXQncyBiZWluZyBkZWxldGVkIGluIHRoZSBzYW1lXG4gKiBkZXBsb3ltZW50IGFzIHRoaXMgQ3VzdG9tIFJlc291cmNlLlxuICpcbiAqIElmIHRoZSBDdXN0b20gUmVzb3VyY2UgaXMgZXZlcnkgZGVsZXRlZCBiZWZvcmUgdGhlIGJ1Y2tldCwgaXQgbXVzdCBiZSBiZWNhdXNlXG4gKiBgYXV0b0RlbGV0ZU9iamVjdHNgIGhhcyBiZWVuIHN3aXRjaGVkIHRvIGZhbHNlLCBpbiB3aGljaCBjYXNlIHRoZSB0YWcgd291bGQgaGF2ZVxuICogYmVlbiByZW1vdmVkIGJlZm9yZSB3ZSBnZXQgdG8gdGhpcyBEZWxldGUgZXZlbnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzQnVja2V0VGFnZ2VkRm9yRGVsZXRpb24oYnVja2V0TmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzMy5nZXRCdWNrZXRUYWdnaW5nKHsgQnVja2V0OiBidWNrZXROYW1lIH0pLnByb21pc2UoKTtcbiAgICByZXR1cm4gcmVzcG9uc2UuVGFnU2V0LnNvbWUodGFnID0+IHRhZy5LZXkgPT09IEFVVE9fREVMRVRFX09CSkVDVFNfVEFHICYmIHRhZy5WYWx1ZSA9PT0gJ3RydWUnKTtcbn1cbiJdfQ==