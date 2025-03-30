#[macro_export]
macro_rules! check_zero {
    ($arr:expr) => {
        if !$arr.iter().any(|amount| *amount == Decimal::ZERO) {
            return err!(ChauError::ZeroAmount);
        }
    };
}

#[macro_export]
macro_rules! add_or_sub {
    ($value_one:expr, $value_two:expr, $is_add:expr) => {
        if $is_add {
            match $value_one.checked_add($value_two) {
                Some(val) => Ok(val),
                None => err!(ChauError::ArthemeticOverflow),
            }
        } else {
            match $value_one.checked_sub($value_two) {
                Some(val) => Ok(val),
                None => err!(ChauError::ArthemeticUnderflow),
            }
        }
    };
}

#[macro_export]
macro_rules! div {
    ($value_one:expr,$value_two:expr) => {
        match $value_one.checked_div($value_two) {
            Some(val) => val,
            None => return Err(ChauError::ArthemeticError.into()),
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
