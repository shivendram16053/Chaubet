// make some mathmatical macros(
//    decimal_devision,
//    check_zero,
//    decimal_subtract_calciulation,
//    decimal_addition_calciulation,
//    decimal_multiplication_calciulation
// )

#[macro_export]
macro_rules! check_zero {
    ($arr:expr) => {
        if $arr.contains(&0u64) {
            return err!(ChauError::ZeroAmount);
        }

        if $arr.contains(&0u64) {
            return err!(ChauError::ZeroAmount);
        }
    };
}

#[macro_export]
macro_rules! add_or_sub {
    ($value_one:expr, $value_two:expr, $is_add:expr, $type:ty) => {
        if $is_add {
            match $value_one.checked_add($value_two) {
                Some(val) => Ok(val),
                None => Err(err!(ChauError::ArthemeticOverflow)),
            }
        } else {
            match $value_one.checked_sub($value_two) {
                Some(val) => Ok(val),
                None => Err(err!(ChauError::AthemeticUnderflow)),
            }
        }
    };
}

#[macro_export]
macro_rules! div {
    ($value_one:expr,$value_two:expr) => {
        match $value_one.checked_div($value_two) {
            Some(val) => val,
            None => return err!(ChauError::ArthemeticError),
        }
    };
}

#[macro_export]
macro_rules! mul {
    ($value_one:expr,$value_two:expr) => {
        match $value_one.checked_mul($value_two) {
            Some(val) => val,
            None => return err!(ChauError::ArthemeticOverflow),
        }
    };
}
