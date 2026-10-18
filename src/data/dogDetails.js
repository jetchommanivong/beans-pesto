// Extra details for the signed-in owner's dog, kept apart from the shared sample
// data so adding it can't clash with other edits. Size matches the three bands the
// council data uses for dog parks (small, medium, large).
//
// These are this one dog's chosen tags. The list everyone chooses from is
// TEMPERAMENT_TAGS in profileData.js. Written as labels because that is the
// format normalizeProfile() migrates from; anything not matching a current label
// is dropped, so keep these in step with that list.
export const dogDetails = {
  size: 'large',
  temperamentTags: ['Reliable recall', 'Playful', 'Good with other dogs', 'Loves fetch'],
}
