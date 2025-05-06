import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import CustomTextField from "../../components/CustomTextField";
import { useMutation, useQuery } from "react-query";
import request from "../../services/http";
import { ADD_SKILL, ADD_SECONDARY_SKILL, GET_SKILLS, GET_SECONDARY_SKILLS_ALL, GET_SECONDARY_SKILLS, CREATE_SKILL_SECONDARYSKILL_RELATION } from "../../constants/Urls";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import { SECTION_TITLES } from '../../constants/Title';

interface SkillsProps {
    id: number;
    skillName: string;
}

interface SecondarySkillsProps {
    id: number;
    secondarySkillName: string;
}

interface SkillFormInputProps {
    skill: string;
}
interface SecondarySkillFormInputProps {
    secondarySkill: string;
}
interface SkillSecondaryRelationFormInputProps {
    skills: SkillsProps;
    secondarySkills: Array<SecondarySkillsProps>;
}



const SkillManagement = () => {
    const [primarySkills, setPrimarySkills] = useState<SkillsProps>();

    const { handleSubmit: handleSubmitSkill, control: controlSkill, formState: { errors: errorsSkill }, reset: resetSkillForm } = useForm<SkillFormInputProps>();
    const { handleSubmit: handleSubmitSecondary, control: controlSecondary, formState: { errors: errorsSecondary }, reset: resetSecondarySkillForm } = useForm<SecondarySkillFormInputProps>();
    const { resetField, setValue, handleSubmit: handleSubmitSkillSecondaryRelation, control: controlSkillSecondaryRelation, formState: { errors: errorsSkillSecondaryRelation }, reset: resetRelationForm } = useForm<SkillSecondaryRelationFormInputProps>();

    const { data: skillsData, isLoading: skillsLoading, isError: skillsError } = useQuery('skills', () => request(GET_SKILLS));
    const { data: allSecondarySkillsData, isLoading: allSecondarySkillsLoading, isError: allSecondarySkillsError } = useQuery('secondarySkills', () => request(GET_SECONDARY_SKILLS_ALL),);
    const { data: secondarySkillsData, isLoading: secondarySkillsLoading, isError: secondarySkillsError } = useQuery(['secondarySkill', primarySkills], () => request(GET_SECONDARY_SKILLS, 'get', { primarySkillIds: primarySkills?.id }), {
        enabled: !!primarySkills,
    });

    useEffect(() => {
        if (!primarySkills) {
            resetField("secondarySkills");
        } else {
            setValue('secondarySkills', secondarySkillsData?.data || []);
        }
    }, [primarySkills, secondarySkillsData]);

    const { mutateAsync: addSkill } = useMutation((body: object) => request(ADD_SKILL, "post", body))
    const { mutateAsync: addSecondarySkill } = useMutation((body: object) => request(ADD_SECONDARY_SKILL, "post", body))
    const { mutateAsync: addSkillSecondarySkillRelation } = useMutation((body: object) => request(CREATE_SKILL_SECONDARYSKILL_RELATION, "post", body))

    const onSubmitSkill: SubmitHandler<SkillFormInputProps> = (data) => {
        addSkill(data).then(() => resetSkillForm())
    }
    const onSubmitSecondarySkill: SubmitHandler<SecondarySkillFormInputProps> = (data) => {
        addSecondarySkill(data).then(() => resetSecondarySkillForm())
    }
    const onSubmitSkillSecondaryRelation: SubmitHandler<SkillSecondaryRelationFormInputProps> = (data) => {
        addSkillSecondarySkillRelation({
            skillId: data.skills?.id,
            secondarySkillIds: data.secondarySkills?.map((item) => item.id)
        }).then(() => {
            resetRelationForm();
            setPrimarySkills(undefined);
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmitSkill(onSubmitSkill)}>
                <h4>{SECTION_TITLES.AddDimensions}</h4>
                <div className="d-flex items-center mb-30">
                    <div className="w-70 mr-25">
                        <Controller
                            name="skill"
                            control={controlSkill}
                            rules={{
                                required: "This field is required",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <CustomTextField
                                    label={SECTION_TITLES.Dimensions1}
                                    onChange={onChange}
                                    className="w-100"
                                    value={value || ""}
                                    error={!!errorsSkill.skill}
                                    helperText={errorsSkill.skill?.message}
                                />
                            )}
                        />
                    </div>
                    <CustomButton
                        type="submit"
                        label="Add"
                        className="mt-30"
                    />
                </div>
            </form>

            <form onSubmit={handleSubmitSecondary(onSubmitSecondarySkill)} className="d-flex items-center mb-50">
                <div className="w-70 mr-25">
                    <Controller
                        name="secondarySkill"
                        control={controlSecondary}
                        rules={{
                            required: "This field is required",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <CustomTextField
                                label={SECTION_TITLES.Dimensions2}
                                onChange={onChange}
                                className="w-100"
                                value={value || ""}
                                error={!!errorsSecondary.secondarySkill}
                                helperText={errorsSecondary.secondarySkill?.message}
                            />
                        )}
                    />
                </div>
                <CustomButton
                    type="submit"
                    label="Add"
                    className="mt-30"
                />
            </form>

            <form onSubmit={handleSubmitSkillSecondaryRelation(onSubmitSkillSecondaryRelation)} className="mb-50">
                <h2>Create Relations</h2>
                <div className="w-70">
                    <Controller
                        name="skills"
                        control={controlSkillSecondaryRelation}
                        rules={{
                            required: "Skill needs to be selected",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                                options={skillsData?.data}
                                getOptionLabel={(skillOptions: SkillsProps) =>
                                    skillOptions.skillName
                                }
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={value || null}
                                label={SECTION_TITLES.Dimensions1}
                                className="w-100 mb-20"
                                // multiple = {true}
                                onChange={(_, selectedValue) => {
                                    setPrimarySkills(selectedValue);
                                    onChange(selectedValue);

                                }}
                                error={!!errorsSkillSecondaryRelation.skills}
                                helperText={errorsSkillSecondaryRelation.skills?.message}
                            />
                        )}
                    />
                </div>
                <div className="w-70">
                    <Controller
                        name="secondarySkills"
                        control={controlSkillSecondaryRelation}
                        render={({ field: { onChange, value } }) => (
                            <CustomAutocomplete
                                options={allSecondarySkillsData?.data}
                                getOptionLabel={(skillOptions: SecondarySkillsProps) =>
                                    skillOptions.secondarySkillName
                                }
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={value || []}
                                label={SECTION_TITLES.Dimensions2}
                                className="w-100 mb-30"
                                multiple={true}
                                onChange={(_, selectedValue) => {
                                    onChange(selectedValue);
                                }}
                            />
                        )}
                    />
                </div>
                <CustomButton
                    type="submit"
                    label="Create Relation"
                    className="primary_btns"
                />
            </form>

        </div>

    )
}

export default SkillManagement