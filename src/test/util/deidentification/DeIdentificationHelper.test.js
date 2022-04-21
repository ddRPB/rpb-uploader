import { replaceContingentsWithMaskedNumberTag, replacePrivateTagsWithDefinedTagPrivate } from "../../../util/deidentification/DeIdentificationHelper";

describe('DeIdentificationHelper Tests',
    () => {
        describe('replaceContingentsWithMaskedNumberTag',
            () => {

                test('returns tag if no contingent matches',
                    () => {
                        const normalTag = '00080008';

                        const result = replaceContingentsWithMaskedNumberTag(normalTag);

                        expect(result).toBe(normalTag);
                    }
                );

                test('returns \'50xxxxxx\' if contingent matches',
                    () => {
                        const originalTag = '50080008';
                        const expectedTag = '50xxxxxx';

                        const result = replaceContingentsWithMaskedNumberTag(originalTag);

                        expect(result).toBe(expectedTag);
                    }
                );

                test('returns \'60xx3000\' if contingent matches',
                    () => {
                        const originalTag = '60083000';
                        const expectedTag = '60xx3000';

                        const result = replaceContingentsWithMaskedNumberTag(originalTag);

                        expect(result).toBe(expectedTag);
                    }
                );

                test('returns \'60xx4000\' if contingent matches',
                    () => {
                        const originalTag = '60084000';
                        const expectedTag = '60xx4000';

                        const result = replaceContingentsWithMaskedNumberTag(originalTag);

                        expect(result).toBe(expectedTag);
                    }
                );

            }
        )


        describe('replacePrivateTagsWithDefinedTagPrivate',
            () => {

                test('returns tag if tag is not private',
                    () => {
                        const normalTag = '00080008';

                        const result = replacePrivateTagsWithDefinedTagPrivate(normalTag);

                        expect(result).toBe(normalTag);
                    }
                );

                test('returns tag if no contingent matches',
                    () => {
                        const originalTag = '00191511';
                        const expectedTag = 'private';

                        const result = replacePrivateTagsWithDefinedTagPrivate(originalTag);

                        expect(result).toBe(expectedTag);
                    }
                );



            }
        )
    }
)